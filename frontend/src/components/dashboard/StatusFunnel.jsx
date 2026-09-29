import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const StatusFunnel = ({ data = {} }) => {
  const chartData = [
    { status: 'SUBMITTED', count: data.SUBMITTED || 0, color: '#a855f7' },
    { status: 'VALIDATED', count: data.VALIDATED || 0, color: '#10b981' },
    { status: 'PRIORITIZED', count: data.PRIORITIZED || 0, color: '#06b6d4' },
    { status: 'ASSIGNED', count: data.ASSIGNED || 0, color: '#38bdf8' },
    { status: 'IN_PROGRESS', count: data.IN_PROGRESS || 0, color: '#3b82f6' },
    { status: 'RETEST', count: data.RETEST || 0, color: '#f59e0b' },
    { status: 'CLOSED', count: data.CLOSED || 0, color: '#64748b' },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
          Lifecycle Pipeline
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">Active vulnerabilities by stage</p>
      </div>

      <div className="h-56 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <XAxis type="number" stroke="#64748b" fontSize={11} fontMono />
            <YAxis
              type="category"
              dataKey="status"
              stroke="#94a3b8"
              fontSize={10}
              tickFormatter={(v) => v.replace('_', ' ')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b111e',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
