export const ROLES = {
  REPORTER: 'REPORTER',
  ANALYST: 'ANALYST',
  DEVELOPER: 'DEVELOPER',
  ADMIN: 'ADMIN',
};

export const VULN_STATUSES = {
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
};

export const PRIORITIES = {
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  P4: 'P4',
};

export const PRIORITY_STYLES = {
  P1: {
    bg: 'bg-red-950/70 text-red-400 border-red-500/40',
    badge: 'bg-red-500/20 text-red-300 border-red-500/50',
    dot: 'bg-red-500',
    label: 'P1 Critical',
  },
  P2: {
    bg: 'bg-orange-950/70 text-orange-400 border-orange-500/40',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    dot: 'bg-orange-500',
    label: 'P2 High',
  },
  P3: {
    bg: 'bg-yellow-950/70 text-yellow-400 border-yellow-500/40',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    dot: 'bg-yellow-500',
    label: 'P3 Medium',
  },
  P4: {
    bg: 'bg-cyan-950/70 text-cyan-400 border-cyan-500/40',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    dot: 'bg-cyan-500',
    label: 'P4 Low',
  },
};

export const STATUS_STYLES = {
  SUBMITTED: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  UNDER_VALIDATION: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  NEEDS_INFO: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  REJECTED: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
  VALIDATED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  DUPLICATE: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  PRIORITIZED: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  OPEN: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  ASSIGNED: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  IN_PROGRESS: 'bg-blue-600/25 text-blue-300 border-blue-400/50',
  RESOLVED: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  RETEST: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  VERIFIED: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50',
  CLOSED: 'bg-slate-800 text-slate-400 border-slate-700',
  REOPENED: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
};

export const CATEGORIES = [
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
];

export const DISCOVERY_SOURCES = [
  { id: 'burp', label: 'Burp Suite' },
  { id: 'nessus', label: 'Nessus' },
  { id: 'openvas', label: 'OpenVAS' },
  { id: 'nmap', label: 'Nmap' },
  { id: 'manual', label: 'Manual Penetration Testing' },
  { id: 'other', label: 'Other / External Disclosure' },
];
