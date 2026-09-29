import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send,
  X
} from 'lucide-react';
import { vulnerabilitiesApi } from '../../api/vulnerabilities.api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, getStatusBadgeVariant, getPriorityBadgeVariant } from '../../utils/formatters';

export const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [responding, setResponding] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState('');
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await vulnerabilitiesApi.getVulnerabilities(params);
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseNotes.trim() || !selectedReport) return;

    try {
      setResponding(true);
      await vulnerabilitiesApi.respondNeedsInfo(selectedReport._id, responseNotes);
      setResponseSuccess('Response submitted successfully! Status returned to Under Validation.');
      setTimeout(() => {
        setSelectedReport(null);
        setResponseNotes('');
        setResponseSuccess('');
        fetchReports();
      }, 1500);
    } catch (err) {
      console.error('Failed to respond:', err);
      setError(err.message || 'Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-cyan-400" />
            My Reported Vulnerabilities
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track validation progress, respond to analyst questions, and monitor remediation.
          </p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 transition-all text-sm"
        >
          + Submit New Finding
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-sm">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, CVE, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_VALIDATION">Under Validation</option>
            <option value="NEEDS_INFO">Needs Information</option>
            <option value="VALIDATED">Validated</option>
            <option value="PRIORITIZED">Prioritized</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
            <option value="DUPLICATE">Duplicate</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" message="Loading your vulnerability reports..." />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300">No reports found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              {search || statusFilter ? 'Try clearing your filters.' : 'You have not submitted any vulnerabilities yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Vulnerability</th>
                  <th className="py-3.5 px-4 font-semibold">Asset</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Reported</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {reports.map((vuln) => (
                  <tr key={vuln._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-sans">
                      <div className="font-semibold text-white hover:text-cyan-400 transition-colors">
                        <Link to={`/vulnerabilities/${vuln._id}`}>
                          {vuln.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {vuln.cveId && (
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-800/50">
                            {vuln.cveId}
                          </span>
                        )}
                        {vuln.duplicate?.isPotentialDuplicate && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            DUP CANDIDATE
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-sans text-slate-300">
                      {vuln.asset ? (
                        <div>
                          <div className="font-medium text-slate-200">{vuln.asset.name}</div>
                          <div className="text-[11px] text-slate-500 capitalize">{vuln.asset.environment}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None specified</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-sans text-slate-300">
                      {vuln.category || 'Other'}
                    </td>

                    <td className="py-4 px-4 font-sans">
                      <Badge variant={getStatusBadgeVariant(vuln.status)}>
                        {vuln.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 font-sans">
                      {vuln.risk?.priority ? (
                        <Badge variant={getPriorityBadgeVariant(vuln.risk.priority)}>
                          {vuln.risk.priority} ({vuln.risk.score.toFixed(0)})
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Pending</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-sans text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(vuln.createdAt)}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-sans text-right">
                      <div className="flex items-center justify-end gap-2">
                        {vuln.status === 'NEEDS_INFO' && (
                          <button
                            onClick={() => setSelectedReport(vuln)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-medium transition-all"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Respond
                          </button>
                        )}
                        <Link
                          to={`/vulnerabilities/${vuln._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-all"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Needs Info Response Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Respond to Analyst Inquiry
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Report: <span className="text-slate-200">{selectedReport.title}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedReport.validation?.notes && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                <span className="font-semibold block mb-1">Analyst Question / Request:</span>
                {selectedReport.validation.notes}
              </div>
            )}

            {responseSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{responseSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleRespond} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Your Additional Information / Clarification
                  </label>
                  <textarea
                    rows={4}
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    required
                    placeholder="Provide additional reproduction steps, network configurations, payload strings, or environment context requested by the analyst..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={responding || !responseNotes.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm shadow-lg shadow-cyan-600/20"
                  >
                    {responding ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Response
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
