import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Copy,
  ShieldCheck
} from 'lucide-react';
import { settingsApi } from '../../api/resources.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SystemSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Local editable weights
  const [weights, setWeights] = useState({
    cvss: 0.30,
    epss: 0.20,
    kev: 0.20,
    assetCriticality: 0.15,
    businessImpact: 0.10,
    exposure: 0.05
  });

  const [thresholds, setThresholds] = useState({
    P1: 70,
    P2: 50,
    P3: 30
  });

  const [slaHours, setSlaHours] = useState({
    P1: 24,
    P2: 72,
    P3: 168,
    P4: 720
  });

  const [duplicateThreshold, setDuplicateThreshold] = useState(0.75);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsApi.getSettings();
      const s = res.data;
      setSettings(s);
      if (s.riskWeights) setWeights(s.riskWeights);
      if (s.priorityThresholds) setThresholds(s.priorityThresholds);
      if (s.slaHoursByPriority) setSlaHours(s.slaHoursByPriority);
      if (s.duplicateThreshold !== undefined) setDuplicateThreshold(s.duplicateThreshold);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.message || 'Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const totalWeight = Object.values(weights).reduce((a, b) => a + Number(b), 0);
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.001;

  const handleWeightChange = (key, val) => {
    setWeights((prev) => ({
      ...prev,
      [key]: parseFloat(val) || 0
    }));
  };

  const handleNormalizeWeights = () => {
    const sum = Object.values(weights).reduce((a, b) => a + Number(b), 0);
    if (sum === 0) return;
    const normalized = {};
    for (const [k, v] of Object.entries(weights)) {
      normalized[k] = parseFloat((v / sum).toFixed(2));
    }
    setWeights(normalized);
  };

  const handleResetDefaults = () => {
    setWeights({
      cvss: 0.30,
      epss: 0.20,
      kev: 0.20,
      assetCriticality: 0.15,
      businessImpact: 0.10,
      exposure: 0.05
    });
    setThresholds({ P1: 70, P2: 50, P3: 30 });
    setSlaHours({ P1: 24, P2: 72, P3: 168, P4: 720 });
    setDuplicateThreshold(0.75);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isWeightValid) {
      setError(`Weights must sum up to exactly 1.0 (currently ${(totalWeight).toFixed(3)}).`);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await settingsApi.updateSettings({
        riskWeights: weights,
        priorityThresholds: thresholds,
        slaHoursByPriority: slaHours,
        duplicateThreshold: parseFloat(duplicateThreshold)
      });
      setSuccessMsg('System configuration and risk engine calibration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Loading configuration parameters..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-7 h-7 text-cyan-400" />
            System Calibration & Risk Formula Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure risk engine mathematical weights, P1–P4 score thresholds, and SLA remediation targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Risk Engine Weights */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                Contextual Risk Weights (Must sum to 1.0)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Controls the relative mathematical influence of each security dimension.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
                isWeightValid
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              }`}>
                Sum: {totalWeight.toFixed(2)} / 1.00
              </span>
              {!isWeightValid && (
                <button
                  type="button"
                  onClick={handleNormalizeWeights}
                  className="px-2 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded text-xs"
                >
                  Auto-normalize
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { key: 'cvss', label: 'CVSS v3.1 Base Score', desc: 'Technical severity of the vulnerability' },
              { key: 'epss', label: 'EPSS Exploitation Likelihood', desc: 'FIRST.org 30-day wild exploit probability' },
              { key: 'kev', label: 'CISA KEV Exploited Catalog', desc: 'Active wild weaponization flag' },
              { key: 'assetCriticality', label: 'Asset Criticality Rating', desc: 'Business importance of affected target (1-5)' },
              { key: 'businessImpact', label: 'Business Impact & Sensitive Data', desc: 'Data sensitivity, impact description, and user reach' },
              { key: 'exposure', label: 'Network Exposure Factor', desc: 'Internet-facing vs internal isolated boundary' },
            ].map((item) => (
              <div key={item.key} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className="font-mono text-cyan-400 font-bold">{(weights[item.key] * 100).toFixed(0)}% ({weights[item.key]})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={weights[item.key]}
                  onChange={(e) => handleWeightChange(item.key, e.target.value)}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Priority Thresholds */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Priority Score Thresholds (P1–P4)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Score boundaries that map the continuous 0–100 risk score into operational tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <label className="text-xs font-bold text-rose-400 block">P1 Critical Min Score</label>
              <input
                type="number"
                min="50"
                max="90"
                value={thresholds.P1}
                onChange={(e) => setThresholds({ ...thresholds, P1: parseInt(e.target.value) || 70 })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono"
              />
              <span className="text-[10px] text-slate-500">Default: 70 (Scores &ge; 70 are P1)</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <label className="text-xs font-bold text-amber-400 block">P2 High Min Score</label>
              <input
                type="number"
                min="30"
                max="70"
                value={thresholds.P2}
                onChange={(e) => setThresholds({ ...thresholds, P2: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono"
              />
              <span className="text-[10px] text-slate-500">Default: 50 (Scores 50–69.99 are P2)</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <label className="text-xs font-bold text-yellow-400 block">P3 Medium Min Score</label>
              <input
                type="number"
                min="10"
                max="50"
                value={thresholds.P3}
                onChange={(e) => setThresholds({ ...thresholds, P3: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono"
              />
              <span className="text-[10px] text-slate-500">Default: 30 (Scores &lt; 30 are P4 Low)</span>
            </div>
          </div>
        </div>

        {/* Section 3: SLA Hours by Priority */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              SLA Remediation Deadlines (Hours)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target resolution times for each tier. Warnings trigger automatically at 75% elapsed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-xs font-bold text-rose-400">P1 (Critical)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={slaHours.P1}
                  onChange={(e) => setSlaHours({ ...slaHours, P1: parseInt(e.target.value) || 24 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
              <span className="text-[10px] text-slate-500">{slaHours.P1 / 24} days</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-xs font-bold text-amber-400">P2 (High)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={slaHours.P2}
                  onChange={(e) => setSlaHours({ ...slaHours, P2: parseInt(e.target.value) || 72 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
              <span className="text-[10px] text-slate-500">{slaHours.P2 / 24} days</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-xs font-bold text-yellow-400">P3 (Medium)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={slaHours.P3}
                  onChange={(e) => setSlaHours({ ...slaHours, P3: parseInt(e.target.value) || 168 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
              <span className="text-[10px] text-slate-500">{slaHours.P3 / 24} days</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-xs font-bold text-emerald-400">P4 (Low)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={slaHours.P4}
                  onChange={(e) => setSlaHours({ ...slaHours, P4: parseInt(e.target.value) || 720 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-white font-mono"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
              <span className="text-[10px] text-slate-500">{slaHours.P4 / 24} days</span>
            </div>
          </div>
        </div>

        {/* Section 4: Duplicate Detection NLP Threshold */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-amber-400" />
                Duplicate Detection NLP Threshold
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Minimum cosine similarity score required to flag a submission as a duplicate candidate.
              </p>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-sm">
              {(duplicateThreshold * 100).toFixed(0)}%
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={duplicateThreshold}
            onChange={(e) => setDuplicateThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !isWeightValid}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20"
          >
            {saving ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /> Save System Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
};
