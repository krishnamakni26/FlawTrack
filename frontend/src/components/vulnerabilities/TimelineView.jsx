import React from 'react';
import { formatDate } from '../../utils/formatters';
import { History, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export const TimelineView = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No audit log timeline entries recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase text-slate-400">
        <History className="w-4 h-4 text-cyan-400" />
        Immutable Lifecycle Audit Trail ({logs.length} events)
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {logs.map((log) => {
          const actionText = log.action.replace(/_/g, ' ');
          return (
            <div key={log._id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-cyan-500/80 border-2 border-cyber-950 ring-2 ring-cyan-500/20" />

              <div className="p-4 rounded-xl glass-card text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">
                      {actionText}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {log.actor?.name || log.actorRole || 'SYSTEM'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {formatDate(log.timestamp)}
                  </span>
                </div>

                {log.before && log.after && (
                  <div className="mt-2 text-slate-400 font-mono text-[11px] flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500">Transition:</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                      {log.before.status || JSON.stringify(log.before)}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {log.after.status || JSON.stringify(log.after)}
                    </span>
                  </div>
                )}

                {log.after && !log.before && (
                  <div className="mt-1 text-slate-400 font-mono text-[11px]">
                    <span className="text-slate-500">Payload: </span>
                    <span className="text-slate-300">{JSON.stringify(log.after)}</span>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>IP: {log.ip || '127.0.0.1'}</span>
                  <span className="truncate max-w-[200px]" title={log.userAgent}>
                    {log.userAgent || 'System'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
