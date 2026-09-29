import React, { useState, useEffect } from 'react';
import { X, Check, Calculator } from 'lucide-react';

const METRIC_DEFS = {
  AV: {
    label: 'Attack Vector (AV)',
    options: [
      { id: 'N', label: 'Network (N)', desc: 'Remotely exploitable across boundaries' },
      { id: 'A', label: 'Adjacent (A)', desc: 'Local subnet or physical proximity' },
      { id: 'L', label: 'Local (L)', desc: 'Local console / user shell access' },
      { id: 'P', label: 'Physical (P)', desc: 'Physical physical touch required' },
    ],
  },
  AC: {
    label: 'Attack Complexity (AC)',
    options: [
      { id: 'L', label: 'Low (L)', desc: 'No specialized conditions needed' },
      { id: 'H', label: 'High (H)', desc: 'Race condition or preparation required' },
    ],
  },
  PR: {
    label: 'Privileges Required (PR)',
    options: [
      { id: 'N', label: 'None (N)', desc: 'Unauthenticated attacker' },
      { id: 'L', label: 'Low (L)', desc: 'Basic user account' },
      { id: 'H', label: 'High (H)', desc: 'Administrative / root privileges' },
    ],
  },
  UI: {
    label: 'User Interaction (UI)',
    options: [
      { id: 'N', label: 'None (N)', desc: 'Zero user interaction required' },
      { id: 'R', label: 'Required (R)', desc: 'Victim must click or open file' },
    ],
  },
  S: {
    label: 'Scope (S)',
    options: [
      { id: 'U', label: 'Unchanged (U)', desc: 'Impact confined to vulnerable software' },
      { id: 'C', label: 'Changed (C)', desc: 'Impact extends to sandbox or host OS' },
    ],
  },
  C: {
    label: 'Confidentiality Impact (C)',
    options: [
      { id: 'N', label: 'None (N)', desc: 'No data disclosure' },
      { id: 'L', label: 'Low (L)', desc: 'Partial or non-critical disclosure' },
      { id: 'H', label: 'High (H)', desc: 'Total database or memory disclosure' },
    ],
  },
  I: {
    label: 'Integrity Impact (I)',
    options: [
      { id: 'N', label: 'None (N)', desc: 'No modification permitted' },
      { id: 'L', label: 'Low (L)', desc: 'Partial file modification' },
      { id: 'H', label: 'High (H)', desc: 'Complete system file or DB alteration' },
    ],
  },
  A: {
    label: 'Availability Impact (A)',
    options: [
      { id: 'N', label: 'None (N)', desc: 'No service interruption' },
      { id: 'L', label: 'Low (L)', desc: 'Reduced performance or intermittent drop' },
      { id: 'H', label: 'High (H)', desc: 'Total service shutdown or kernel crash' },
    ],
  },
};

// Client-side CVSS v3.1 base score computation
const roundUp = (input) => {
  const intInput = Math.round(input * 100000);
  if (intInput % 10000 === 0) return intInput / 100000;
  return (Math.floor(intInput / 10000) + 1) / 10;
};

const calculateCvss = (m) => {
  const avW = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
  const acW = { L: 0.77, H: 0.44 };
  const prW = m.S === 'C' ? { N: 0.85, L: 0.68, H: 0.5 } : { N: 0.85, L: 0.62, H: 0.27 };
  const uiW = { N: 0.85, R: 0.62 };
  const ciaW = { N: 0, L: 0.22, H: 0.56 };

  const av = avW[m.AV] ?? 0.85;
  const ac = acW[m.AC] ?? 0.77;
  const pr = prW[m.PR] ?? 0.85;
  const ui = uiW[m.UI] ?? 0.85;
  const c = ciaW[m.C] ?? 0.56;
  const i = ciaW[m.I] ?? 0.56;
  const a = ciaW[m.A] ?? 0.56;

  const iss = 1 - (1 - c) * (1 - i) * (1 - a);
  let impact = m.S === 'C' ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss;
  const exploitability = 8.22 * av * ac * pr * ui;

  let baseScore;
  if (impact <= 0) baseScore = 0.0;
  else if (m.S !== 'C') baseScore = roundUp(Math.min(impact + exploitability, 10));
  else baseScore = roundUp(Math.min(1.08 * (impact + exploitability), 10));

  const score = Math.round(baseScore * 10) / 10;
  let severity = 'None';
  if (score > 0 && score < 4.0) severity = 'Low';
  else if (score < 7.0) severity = 'Medium';
  else if (score < 9.0) severity = 'High';
  else if (score >= 9.0) severity = 'Critical';

  return { score, severity };
};

export const CvssCalculatorModal = ({ isOpen, onClose, initialVector, onSave }) => {
  const [metrics, setMetrics] = useState({
    AV: 'N',
    AC: 'L',
    PR: 'N',
    UI: 'N',
    S: 'U',
    C: 'H',
    I: 'H',
    A: 'H',
  });

  useEffect(() => {
    if (initialVector && initialVector.startsWith('CVSS:3.1/')) {
      const parts = initialVector.replace('CVSS:3.1/', '').split('/');
      const parsed = {};
      for (const p of parts) {
        const [k, v] = p.split(':');
        if (k && v) parsed[k] = v;
      }
      setMetrics((prev) => ({ ...prev, ...parsed }));
    }
  }, [initialVector]);

  if (!isOpen) return null;

  const { score, severity } = calculateCvss(metrics);
  const vectorString = `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`;

  const getScoreColor = (sc) => {
    if (sc >= 9.0) return 'text-red-400 bg-red-950/60 border-red-500/50';
    if (sc >= 7.0) return 'text-orange-400 bg-orange-950/60 border-orange-500/50';
    if (sc >= 4.0) return 'text-yellow-400 bg-yellow-950/60 border-yellow-500/50';
    return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono">
              CVSS v3.1 Interactive Vector Calculator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Vector Banner */}
        <div className="px-6 py-4 bg-cyber-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Computed Vector String
            </div>
            <div className="font-mono text-xs text-cyan-300 select-all font-semibold mt-0.5">
              {vectorString}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-mono flex items-center gap-2 ${getScoreColor(score)}`}>
              <span className="text-2xl font-black">{score.toFixed(1)}</span>
              <span className="text-xs uppercase font-semibold">{severity}</span>
            </div>
          </div>
        </div>

        {/* Metric Selector Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(METRIC_DEFS).map(([key, def]) => (
              <div key={key} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2 font-mono">
                  {def.label}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {def.options.map((opt) => {
                    const isSelected = metrics[key] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMetrics((prev) => ({ ...prev, [key]: opt.id }))}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ vector: vectorString, baseScore: score, severity });
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-semibold text-sm hover:bg-cyan-400 flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Check className="w-4 h-4 stroke-[2.5]" /> Apply to Report
          </button>
        </div>
      </div>
    </div>
  );
};
