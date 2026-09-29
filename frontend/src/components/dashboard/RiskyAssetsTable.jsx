import React from 'react';
import { Server, Globe, Lock, ShieldAlert } from 'lucide-react';

export const RiskyAssetsTable = ({ assets = [] }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Top Riskiest Infrastructure Assets
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Ranked by composite threat severity and exposure</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[11px] text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Environment</th>
              <th className="py-2.5 px-3">Exposure</th>
              <th className="py-2.5 px-3">Criticality</th>
              <th className="py-2.5 px-3">Active Flaws</th>
              <th className="py-2.5 px-3">Max Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {assets.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-center text-slate-500">
                  No risky assets identified.
                </td>
              </tr>
            ) : (
              assets.map((a) => (
                <tr key={a.assetId} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{a.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{a.type}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize">{a.environment}</span>
                  </td>
                  <td className="py-3 px-3">
                    {a.internetFacing ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 text-[10px]">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                        <Lock className="w-3 h-3" /> Internal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-cyan-400 font-bold">{a.criticality} / 5</span>
                  </td>
                  <td className="py-3 px-3 font-bold">
                    {a.vulnCount}
                    {a.p1Count > 0 && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                        {a.p1Count} P1
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-black ${
                        a.maxRisk >= 70 ? 'text-red-400' : a.maxRisk >= 50 ? 'text-orange-400' : 'text-yellow-400'
                      }`}
                    >
                      {a.maxRisk} / 100
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
