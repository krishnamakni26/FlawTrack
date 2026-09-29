import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';
import { jobsApi } from '../../api/resources.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const JobControlPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(null);
  const [jobResults, setJobResults] = useState({});
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobsApi.getJobs();
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load jobs status:', err);
      setError(err.message || 'Failed to fetch background job registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRunJob = async (jobName) => {
    try {
      setRunningJob(jobName);
      setError(null);
      const res = await jobsApi.runJob(jobName);
      setJobResults((prev) => ({
        ...prev,
        [jobName]: {
          timestamp: new Date().toISOString(),
          data: res.data
        }
      }));
      fetchJobs();
    } catch (err) {
      console.error(`Failed to execute ${jobName}:`, err);
      setError(err.message || `Execution failed for job ${jobName}`);
    } finally {
      setRunningJob(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyan-400" />
            Background Job Engine & Demon Daemon Control
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Trigger scheduled cron processes on-demand for verification, live threat ingestion, and SLA breach sweeps.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job 1: SLA Monitor */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">SLA Monitor Job</h3>
                <span className="text-[11px] font-mono text-cyan-400">cron: '*/15 * * * *' (Every 15 min)</span>
              </div>
            </div>

            <button
              onClick={() => handleRunJob('sla-monitor')}
              disabled={runningJob === 'sla-monitor'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20"
            >
              {runningJob === 'sla-monitor' ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Run Now
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Scans active vulnerabilities (SUBMITTED, VALIDATED, OPEN, ASSIGNED, IN_PROGRESS). Fires automated warning notifications when 75% of remediation time has elapsed, and records official SLA breaches with priority escalation when deadline expires.
          </p>

          {jobResults['sla-monitor'] && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-xs font-mono">
              <div className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> SLA Sweep Executed
              </div>
              <pre className="text-slate-300 text-[11px] overflow-x-auto">
                {JSON.stringify(jobResults['sla-monitor'].data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Job 2: Threat Intel Refresh */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Threat Intelligence Refresh</h3>
                <span className="text-[11px] font-mono text-purple-400">cron: '0 2 * * *' (Daily 2 AM)</span>
              </div>
            </div>

            <button
              onClick={() => handleRunJob('threat-refresh')}
              disabled={runningJob === 'threat-refresh'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-600/20"
            >
              {runningJob === 'threat-refresh' ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Run Now
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Pulls newest CISA KEV catalog feed and refreshes EPSS probabilities for all active CVE-linked vulnerabilities. Automatically recalculates contextual risk scores and logs priority escalations (e.g. P3 &rarr; P1 upon KEV addition) to the audit log.
          </p>

          {jobResults['threat-refresh'] && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-xs font-mono">
              <div className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Threat Refresh Executed
              </div>
              <pre className="text-slate-300 text-[11px] overflow-x-auto">
                {JSON.stringify(jobResults['threat-refresh'].data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
