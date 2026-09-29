import React from 'react';
import { PRIORITY_STYLES, STATUS_STYLES } from '../../utils/constants';

export const Badge = ({ variant = 'default', size = 'sm', children, className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm font-semibold'
  };

  const style = variantStyles[variant] || variantStyles.default;
  const sz = sizeClasses[size] || sizeClasses.sm;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium uppercase tracking-wider ${style} ${sz} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'sm' }) => {
  if (!priority) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
        Unranked
      </span>
    );
  }

  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.P4;
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono tracking-wide ${style.badge} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {style.label}
    </span>
  );
};

export const StatusBadge = ({ status, size = 'sm' }) => {
  if (!status) return null;

  const styleClass = STATUS_STYLES[status] || 'bg-slate-800 text-slate-300 border-slate-700';
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  const readable = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium uppercase tracking-wider ${styleClass} ${sizeClasses}`}
    >
      {readable}
    </span>
  );
};
