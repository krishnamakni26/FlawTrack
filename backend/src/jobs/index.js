const cron = require('node-cron');
const SlaMonitorJob = require('./slaMonitor.job');
const ThreatRefreshJob = require('./threatRefresh.job');
const logger = require('../utils/logger');
const env = require('../config/env');

const jobs = {
  'sla-monitor': SlaMonitorJob,
  'threat-refresh': ThreatRefreshJob,
};

const jobHistory = {};

const runJob = async (jobName) => {
  const job = jobs[jobName];
  if (!job) {
    throw new Error(`Job '${jobName}' not recognized. Available: ${Object.keys(jobs).join(', ')}`);
  }

  const result = await job.execute();
  jobHistory[jobName] = {
    lastRunAt: new Date(),
    result,
  };
  return result;
};

const initCronJobs = () => {
  if (env.NODE_ENV === 'test') {
    logger.debug('Skipping cron job initialization in test mode');
    return;
  }

  // SLA Monitor: Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running scheduled SLA monitor cron...');
    try {
      await runJob('sla-monitor');
    } catch (err) {
      logger.error(`[CRON] SLA monitor failed unexpectedly: ${err.message}`, { stack: err.stack });
    }
  });

  // Threat Refresh: Run daily at 02:00 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running scheduled Threat Intel refresh cron...');
    try {
      await runJob('threat-refresh');
    } catch (err) {
      logger.error(`[CRON] Threat refresh failed unexpectedly: ${err.message}`, { stack: err.stack });
    }
  });

  logger.info('Cron jobs successfully scheduled: SLA Monitor (*/15m), Threat Refresh (Daily at 02:00)');
};

module.exports = {
  initCronJobs,
  runJob,
  getJobStatus: () => jobHistory,
};
