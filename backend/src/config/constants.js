/**
 * VulnTrack System Constants
 */

const ROLES = Object.freeze({
  REPORTER: 'REPORTER',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
});

const VULN_STATUSES = Object.freeze({
  SUBMITTED: 'SUBMITTED',
  UNDER_VALIDATION: 'UNDER_VALIDATION',
  NEEDS_INFO: 'NEEDS_INFO',
  REJECTED: 'REJECTED',
  VALIDATED: 'VALIDATED',
  DUPLICATE: 'DUPLICATE',
  PRIORITIZED: 'PRIORITIZED',
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  RETEST: 'RETEST',
  VERIFIED: 'VERIFIED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
});

const PRIORITIES = Object.freeze({
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  P4: 'P4',
});

const CATEGORIES = Object.freeze([
  'SQL Injection',
  'XSS',
  'SSRF',
  'CSRF',
  'IDOR',
  'RCE',
  'Auth Bypass',
  'Misconfiguration',
  'Info Disclosure',
  'Other',
]);

const DISCOVERY_SOURCES = Object.freeze([
  'nmap',
  'nessus',
  'openvas',
  'burp',
  'manual',
  'other',
]);

const ASSET_TYPES = Object.freeze([
  'web-app',
  'api',
  'server',
  'database',
  'network-device',
  'other',
]);

const ASSET_ENVIRONMENTS = Object.freeze([
  'production',
  'staging',
  'development',
  'test',
]);

const AUDIT_ACTIONS = Object.freeze({
  VULN_CREATED: 'VULN_CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  VALIDATED: 'VALIDATED',
  DUPLICATE_FLAGGED: 'DUPLICATE_FLAGGED',
  DUPLICATE_RESOLVED: 'DUPLICATE_RESOLVED',
  CLASSIFIED: 'CLASSIFIED',
  CVSS_UPDATED: 'CVSS_UPDATED',
  THREAT_REFRESHED: 'THREAT_REFRESHED',
  RISK_RECALCULATED: 'RISK_RECALCULATED',
  ASSIGNED: 'ASSIGNED',
  REMEDIATION_NOTE_ADDED: 'REMEDIATION_NOTE_ADDED',
  SLA_WARNING: 'SLA_WARNING',
  SLA_BREACHED: 'SLA_BREACHED',
  RETEST_PASSED: 'RETEST_PASSED',
  RETEST_FAILED: 'RETEST_FAILED',
  LOGIN: 'LOGIN',
  LOGIN_FAILED: 'LOGIN_FAILED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  ASSET_CREATED: 'ASSET_CREATED',
  ASSET_UPDATED: 'ASSET_UPDATED',
  ASSET_DELETED: 'ASSET_DELETED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  JOB_EXECUTED: 'JOB_EXECUTED',
});

const DEFAULT_RISK_WEIGHTS = Object.freeze({
  cvss: 0.30,
  epss: 0.20,
  kev: 0.20,
  assetCriticality: 0.15,
  businessImpact: 0.10,
  exposure: 0.05,
});

const DEFAULT_PRIORITY_THRESHOLDS = Object.freeze({
  p1: 70,
  p2: 50,
  p3: 30,
});

const DEFAULT_SLA_HOURS = Object.freeze({
  P1: 24,
  P2: 72,
  P3: 168, // 7 days
  P4: 720, // 30 days
});

const DEFAULT_EXPOSURE_VALUES = Object.freeze({
  internetFacingProduction: 1.0,
  internetFacingNonProduction: 0.7,
  internal: 0.4,
  isolatedTest: 0.1,
});

const DEFAULT_DUPLICATE_THRESHOLD = 0.75;
const DEFAULT_SLA_WARNING_PERCENT = 75;

module.exports = {
  ROLES,
  VULN_STATUSES,
  PRIORITIES,
  CATEGORIES,
  DISCOVERY_SOURCES,
  ASSET_TYPES,
  ASSET_ENVIRONMENTS,
  AUDIT_ACTIONS,
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_PRIORITY_THRESHOLDS,
  DEFAULT_SLA_HOURS,
  DEFAULT_EXPOSURE_VALUES,
  DEFAULT_DUPLICATE_THRESHOLD,
  DEFAULT_SLA_WARNING_PERCENT,
};
