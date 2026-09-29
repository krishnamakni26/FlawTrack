import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Zap } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const WhatIfWidget = ({ initialVuln, initialAsset, settings }) => {
  const [criticality, setCriticality] = useState(initialAsset?.criticality || 3);
  const [dataSensitivity, setDataSensitivity] = useState(initialAsset?.dataSensitivity || 3);
  const [environment, setEnvironment] = useState(initialAsset?.environment || 'production');
  const [internetFacing, setInternetFacing] = useState(
    initialAsset?.internetFacing ?? initialVuln?.internetFacing ?? false
  );

  const [simulatedScore, setSimulatedScore] = useState(initialVuln?.risk?.score || 50);
  const [simulatedPriority, setSimulatedPriority] = useState(initialVuln?.risk?.priority || 'P2');

  const weights = settings?.riskWeights || {
    cvss: 0.3,
    epss: 0.2,
    kev: 0.2,
    assetCriticality: 0.15,
    businessImpact: 0.1,
    exposure: 0.05,
  };

  const thresholds = settings?.priorityThresholds || { p1: 70, p2: 50, p3: 30 };
  const expVals = settings?.exposureValues || {
    internetFacingProduction: 1.0,
    internetFacingNonProduction: 0.7,
    internal: 0.4,
    isolatedTest: 0.1,
  };

  // Recompute simulated risk client-side
  useEffect(() => {
    const cvssScore = initialVuln?.cvss?.baseScore ?? 5.0;
    const cvssN = Math.min(1.0, Math.max(0, cvssScore / 10));
    const epssN = Math.min(1.0, Math.max(0, initialVuln?.threat?.epss ?? 0));
    const kevN = initialVuln?.threat?.inKev ? 1.0 : 0;

    const assetCritN = (criticality - 1) / 4.0;
    const dataSensN = (dataSensitivity - 1) / 4.0;

    let usersN = 0.3;
    const count = initialVuln?.affectedUsersCount || 0;
    if (count <= 10) usersN = 0.1;
    else if (count <= 100) usersN = 0.3;
    else if (count <= 1000) usersN = 0.6;
    else if (count <= 10000) usersN = 0.8;
    else usersN = 1.0;

    const businessImpactN = 0.5 * dataSensN + 0.5 * usersN;

    let exposureN = expVals.internal;
    if (internetFacing && environment === 'production') {
      exposureN = expVals.internetFacingProduction;
    } else if (internetFacing && environment !== 'production') {
      exposureN = expVals.internetFacingNonProduction;
    } else if (environment === 'test' || environment === 'development') {
      exposureN = expVals.isolatedTest;
    }

    const raw =
      100 *
      (weights.cvss * cvssN +
        weights.epss * epssN +
        weights.kev * kevN +
        weights.assetCriticality * assetCritN +
        weights.businessImpact * businessImpactN +
        weights.exposure * exposureN);

    const score = Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10;

    let priority = 'P4';
    if (score >= thresholds.p1) priority = 'P1';
    else if (score >= thresholds.p2) priority = 'P2';
    else if (score >= thresholds.p3) priority = 'P3';

    // Overrides
    if (initialVuln?.threat?.inKev && internetFacing && priority !== 'P1') {
      priority = 'P1';
    }
    if (cvssScore >= 9.0 && (priority === 'P3' || priority === 'P4')) {
      priority = 'P2';
    }

    setSimulatedScore(score);
    setSimulatedPriority(priority);
  }, [criticality, dataSensitivity, environment, internetFacing, initialVuln, weights, thresholds, expVals]);

  const handleReset = () => {
    setCriticality(initialAsset?.criticality || 3);
    setDataSensitivity(initialAsset?.dataSensitivity || 3);
    setEnvironment(initialAsset?.environment || 'production');
    setInternetFacing(initialAsset?.internetFacing ?? initialVuln?.internetFacing ?? false);
  };

  const isDifferent =
    simulatedPriority !== (initialVuln?.risk?.priority || 'P2') ||
    simulatedScore !== (initialVuln?.risk?.score || 50);

  return (
    <div className="p-5 rounded-xl border border-cyan-500/30 bg-cyber-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
            Context "What-If" Simulator
          </h4>
        </div>
        <button
          onClick={handleReset}
          className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        Simulate changing the asset context to verify how context-aware scoring dynamically shifts prioritization:
      </p>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-mono">
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Asset Criticality:</span>
            <span className="text-cyan-400 font-bold">{criticality} / 5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={criticality}
            onChange={(e) => setCriticality(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Data Sensitivity:</span>
            <span className="text-cyan-400 font-bold">{dataSensitivity} / 5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={dataSensitivity}
            onChange={(e) => setDataSensitivity(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-1">Environment:</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full p-1.5 rounded-lg bg-cyber-950 border border-slate-700 text-slate-200 text-xs"
          >
            <option value="production">production</option>
            <option value="staging">staging</option>
            <option value="development">development</option>
            <option value="test">test (isolated)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 mb-1">Internet Facing:</label>
          <button
            type="button"
            onClick={() => setInternetFacing(!internetFacing)}
            className={`w-full p-1.5 rounded-lg border text-center transition font-bold text-xs ${
              internetFacing
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {internetFacing ? 'YES (Publicly Exposed)' : 'NO (Internal Only)'}
          </button>
        </div>
      </div>

      {/* Simulation Result Output */}
      <div className="mt-5 p-3 rounded-lg bg-cyber-950 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">Simulated Outcome</div>
          <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
            Score: <span className="text-cyan-400">{simulatedScore}</span>
            <span className="text-xs text-slate-500"> / 100</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PriorityBadge priority={simulatedPriority} size="lg" />
          {isDifferent && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 animate-pulse">
              Context Shift!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
