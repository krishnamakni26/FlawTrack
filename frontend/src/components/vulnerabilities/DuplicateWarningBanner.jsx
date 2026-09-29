import React from 'react';
import { AlertTriangle, Copy, ExternalLink, Check, X, GitMerge } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DuplicateWarningBanner = ({
  matches = [],
  isFormHint = false,
  onConfirm = null,
  onDismiss = null,
  onMerge = null,
}) => {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-amber-200">
              {isFormHint ? 'Possible Duplicate Finding Detected' : 'Potential Duplicate Reports Flagged'}
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {Math.round((matches[0]?.similarity || 0) * 100)}% Max Similarity
            </span>
          </div>

          <p className="text-xs text-amber-300/80 mt-1">
            {isFormHint
              ? 'Our NLP similarity engine detected existing reports with matching wording or identifiers. Please review before submitting to prevent duplicate triage.'
              : 'The automated NLP similarity engine flagged the following active vulnerability reports:'}
          </p>

          <div className="mt-3 space-y-2">
            {matches.map((m, idx) => {
              const id = m.vulnerabilityId?._id || m.vulnerabilityId || m._id;
              const title = m.title || m.vulnerabilityId?.title || 'Existing Report';
              const simPct = Math.round((m.similarity || 0) * 100);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-900/80 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="font-mono text-[11px] text-cyan-400 font-bold">
                      {simPct}%
                    </span>
                    <span className="text-slate-200 truncate">{title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {id && (
                      <Link
                        to={`/vulnerabilities/${id}`}
                        target="_blank"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {!isFormHint && onConfirm && (
                      <button
                        onClick={() => onConfirm(id)}
                        className="px-2 py-1 rounded bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 border border-rose-500/40 text-[11px] flex items-center gap-1"
                        title="Mark current report as Duplicate"
                      >
                        <Check className="w-3 h-3" /> Duplicate
                      </button>
                    )}

                    {!isFormHint && onMerge && (
                      <button
                        onClick={() => onMerge(id)}
                        className="px-2 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/40 text-[11px] flex items-center gap-1"
                        title="Merge evidence into original report"
                      >
                        <GitMerge className="w-3 h-3" /> Merge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isFormHint && onDismiss && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={onDismiss}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Dismiss Duplicate Flag
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
