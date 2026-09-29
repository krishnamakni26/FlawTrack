import React from 'react';
import { PriorityBadge } from '../common/Badge';
import { WhatIfWidget } from './WhatIfWidget';
import { ShieldAlert, Info, CheckCircle2, AlertOctagon } from 'lucide-react';

export const RiskBreakdownChart = ({ vuln, asset, settings }) => {
  const risk = vuln?.risk || {};
  const score = risk.score !== null && risk.score !== undefined ? risk.score : 0;
  const priority = risk.priority;
  const breakdown = risk.breakdown || {};
  const explanation = risk.explanation || [];

  const factors = [
    { label: 'Technical Severity (CVSS)', val: breakdown.cvssWeight || 0, max: 30, color: 'bg-red-500' },
    { label: 'Weaponization (EPSS)', val: breakdown.epssWeight || 0, max: 20, color: 'bg-orange-500' },
    { label: 'Wild Exploitation (CISA KEV)', val: breakdown.kevWeight || 0, max: 20, color: 'bg-rose-500' },
    { label: 'Asset Criticality', val: breakdown.assetCriticalityWeight || 0, max: 15, color: 'bg-amber-500' },
    { label: 'Business & Data Impact', val: breakdown.businessImpactWeight || 0, max: 10, color: 'bg-blue-500' },
    { label: 'Network Exposure', val: breakdown.exposureWeight || 0, max: 5, color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Score Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Composite Threat-Aware Risk Score
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-black font-mono text-slate-100 tracking-tight">
              {score}
            </span>
            <span className="text-sm font-mono text-slate-500">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated using multidimensional weights: CVSS 30%, EPSS 20%, KEV 20%, Asset 15%, Business 10%, Exposure 5%.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <PriorityBadge priority={priority} size="lg" />
          {vuln?.threat?.inKev && (
            <span className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 text-xs font-mono flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> CISA KEV Listed
            </span>
          )}
        </div>
      </div>

      {/* Weighted Component Breakdown Bars */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          Weighted Factor Contribution (0–100 Points)
        </h4>

        <div className="space-y-3 pt-2">
          {factors.map((f, idx) => {
            const pct = Math.min(100, Math.round((f.val / f.max) * 100));
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{f.label}</span>
                  <span className="text-slate-400 font-bold">
                    {f.val.toFixed(1)} <span className="text-slate-600">/ {f.max} pts</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${f.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Explainable Reasoning */}
      {explanation.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Explainable Priority Rationale
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {explanation.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive What-If Simulator */}
      <WhatIfWidget
        initialVuln={vuln}
        initialAsset={asset}
        settings={settings}
      />
    </div>
  );
};
