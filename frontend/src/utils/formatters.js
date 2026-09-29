export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
};

export const formatSlaRemaining = (sla) => {
  if (!sla || !sla.dueAt) return { text: 'No SLA', isBreached: false, isWarning: false };
  const diffMs = new Date(sla.dueAt).getTime() - Date.now();
  const hoursRemaining = Math.round((diffMs / (3600 * 1000)) * 10) / 10;

  if (hoursRemaining <= 0) {
    return {
      text: `Breached (${Math.abs(hoursRemaining)}h overdue)`,
      isBreached: true,
      isWarning: false,
    };
  }

  if (hoursRemaining < 24) {
    return {
      text: `${hoursRemaining}h remaining`,
      isBreached: false,
      isWarning: hoursRemaining < 6,
    };
  }

  const days = Math.round(hoursRemaining / 24);
  return {
    text: `${days}d remaining`,
    isBreached: false,
    isWarning: false,
  };
};

export const getStatusBadgeVariant = (status) => {
  if (!status) return 'default';
  if (status === 'VALIDATED' || status === 'VERIFIED' || status === 'CLOSED') return 'success';
  if (status === 'IN_PROGRESS' || status === 'PRIORITIZED' || status === 'OPEN' || status === 'ASSIGNED') return 'info';
  if (status === 'NEEDS_INFO' || status === 'DUPLICATE') return 'warning';
  if (status === 'REJECTED' || status === 'REOPENED') return 'danger';
  if (status === 'UNDER_VALIDATION' || status === 'RETEST') return 'purple';
  return 'default';
};

export const getPriorityBadgeVariant = (priority) => {
  if (!priority) return 'default';
  if (priority === 'P1') return 'danger';
  if (priority === 'P2') return 'warning';
  if (priority === 'P3') return 'info';
  if (priority === 'P4') return 'success';
  return 'default';
};

export const formatSlaCountdown = (dueAt, breached) => {
  if (!dueAt) return { text: 'No SLA', className: 'bg-slate-800 text-slate-400' };
  if (breached) {
    return { text: 'BREACHED', className: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' };
  }
  const diffMs = new Date(dueAt).getTime() - Date.now();
  if (diffMs <= 0) {
    return { text: 'BREACHED', className: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' };
  }
  const hours = Math.round(diffMs / (3600 * 1000));
  if (hours < 24) {
    return {
      text: `${hours}h left`,
      className: hours <= 6 
        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
    };
  }
  const days = Math.round(hours / 24);
  return {
    text: `${days}d left`,
    className: 'bg-slate-800 text-slate-300 border border-slate-700'
  };
};
