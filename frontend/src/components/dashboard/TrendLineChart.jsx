import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const TrendLineChart = ({ data = [] }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
            Vulnerability Inflow vs Outflow Trend
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">8-Week historical throughput trajectory</p>
        </div>
      </div>

      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
            Awaiting historical trend data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
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
              <Legend
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="reported"
                name="Reported"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorReported)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Remediated"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorResolved)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
