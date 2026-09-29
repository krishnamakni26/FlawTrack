import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'cyan', alert = false }) => {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40',
    red: 'text-red-400 bg-red-950/60 border-red-800/40',
    amber: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
    blue: 'text-blue-400 bg-blue-950/60 border-blue-800/40',
    purple: 'text-purple-400 bg-purple-950/60 border-purple-800/40',
  };

  const currentStyle = colorMap[color] || colorMap.cyan;

  return (
    <div className={`p-5 rounded-2xl glass-card flex flex-col justify-between ${alert ? 'border-red-500/50 glow-red' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${currentStyle}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-black font-mono tracking-tight text-slate-100">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
