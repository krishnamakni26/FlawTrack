import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import { VULN_STATUSES } from '../../utils/constants';

const ALLOWED_NEXT_STATUSES = {
  [VULN_STATUSES.SUBMITTED]: [VULN_STATUSES.UNDER_VALIDATION],
  [VULN_STATUSES.UNDER_VALIDATION]: [
    VULN_STATUSES.VALIDATED,
    VULN_STATUSES.NEEDS_INFO,
    VULN_STATUSES.REJECTED,
  ],
  [VULN_STATUSES.NEEDS_INFO]: [VULN_STATUSES.UNDER_VALIDATION],
  [VULN_STATUSES.VALIDATED]: [VULN_STATUSES.PRIORITIZED],
  [VULN_STATUSES.PRIORITIZED]: [VULN_STATUSES.OPEN, VULN_STATUSES.ASSIGNED],
  [VULN_STATUSES.OPEN]: [VULN_STATUSES.ASSIGNED],
  [VULN_STATUSES.ASSIGNED]: [VULN_STATUSES.IN_PROGRESS],
  [VULN_STATUSES.IN_PROGRESS]: [VULN_STATUSES.RESOLVED],
  [VULN_STATUSES.RESOLVED]: [VULN_STATUSES.RETEST],
  [VULN_STATUSES.RETEST]: [VULN_STATUSES.VERIFIED, VULN_STATUSES.REOPENED],
  [VULN_STATUSES.VERIFIED]: [VULN_STATUSES.CLOSED],
  [VULN_STATUSES.REOPENED]: [VULN_STATUSES.ASSIGNED, VULN_STATUSES.IN_PROGRESS],
};

export const StatusTransitionModal = ({ isOpen, onClose, currentStatus, onTransition }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validTargets = ALLOWED_NEXT_STATUSES[currentStatus] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;
    setLoading(true);
    try {
      await onTransition(selectedStatus, notes);
      onClose();
    } catch (err) {
      // error handled by caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              Lifecycle Transition Guard
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <span className="text-xs font-mono text-slate-400">Current Status:</span>
            <div className="mt-1 font-mono text-xs font-bold text-cyan-400 uppercase">
              {currentStatus}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2">
              Select Permitted Destination State:
            </label>
            {validTargets.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">
                No legal onward transitions from current status.
              </p>
            ) : (
              <div className="space-y-2">
                {validTargets.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`w-full p-2.5 rounded-lg border text-left font-mono text-xs transition flex items-center justify-between ${
                      selectedStatus === st
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{st}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Transition Reason / Audit Notes:
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context for this lifecycle transition..."
              className="w-full p-2.5 rounded-lg bg-cyber-950 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStatus || loading}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Transitioning...' : 'Confirm Transition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
