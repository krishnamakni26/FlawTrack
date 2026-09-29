import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  P1: '#ef4444',
  P2: '#f97316',
  P3: '#eab308',
  P4: '#06b6d4',
};

export const PriorityDonut = ({ data = {} }) => {
  const chartData = [
    { name: 'P1 Critical', key: 'P1', value: data.P1 || 0, color: COLORS.P1 },
    { name: 'P2 High', key: 'P2', value: data.P2 || 0, color: COLORS.P2 },
    { name: 'P3 Medium', key: 'P3', value: data.P3 || 0, color: COLORS.P3 },
    { name: 'P4 Low', key: 'P4', value: data.P4 || 0, color: COLORS.P4 },
  ];

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
          Priority Distribution
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">Aggregated risk buckets</p>
      </div>

      <div className="h-52 my-3 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#070b14" strokeWidth={2} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
        {/* Center Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black font-mono text-slate-100">{total}</span>
          <span className="text-[10px] uppercase font-mono text-slate-400">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-400">{item.key}</span>
            </div>
            <span className="font-bold text-slate-200">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
