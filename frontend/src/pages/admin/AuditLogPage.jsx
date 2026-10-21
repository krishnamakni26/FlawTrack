import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  ShieldAlert, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { auditApi } from '../../api/resources.api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entityType = entityFilter;

      const res = await auditApi.getAuditLogs(params);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to fetch audit records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const handleExportCsv = async () => {
    try {
      const res = await auditApi.exportAuditLogsCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `flawtrack_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export audit log CSV');
    }
  };

  const getActionBadgeVariant = (action) => {
    if (action.includes('BREACH') || action.includes('FAILED') || action.includes('REJECTED')) return 'danger';
    if (action.includes('WARNING') || action.includes('DUPLICATE')) return 'warning';
    if (action.includes('PASSED') || action.includes('CLOSED') || action.includes('VALIDATED')) return 'success';
    if (action.includes('RECALCULATED') || action.includes('PRIORITIZED')) return 'purple';
    return 'info';
  };

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(term) ||
      l.actor?.name?.toLowerCase().includes(term) ||
      l.actor?.email?.toLowerCase().includes(term) ||
      l.entityId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-cyan-400" />
            Immutable Security Audit Trail
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tamper-proof, append-only chronological log of all lifecycle events, score adjustments, and user actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/20"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by actor or entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Actions</option>
            <option value="VULN_CREATED">Vulnerability Created</option>
            <option value="STATUS_CHANGED">Status Changed</option>
            <option value="VALIDATED">Validated</option>
            <option value="DUPLICATE_FLAGGED">Duplicate Flagged</option>
            <option value="RISK_RECALCULATED">Risk Recalculated</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="SLA_WARNING">SLA Warning</option>
            <option value="SLA_BREACHED">SLA Breached</option>
            <option value="RETEST_PASSED">Retest Passed</option>
            <option value="RETEST_FAILED">Retest Failed</option>
            <option value="LOGIN">User Login</option>
            <option value="SETTINGS_CHANGED">Settings Changed</option>
            <option value="THREAT_REFRESH">Threat Refresh</option>
          </select>
        </div>

        <div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Entity Types</option>
            <option value="Vulnerability">Vulnerability</option>
            <option value="User">User</option>
            <option value="Asset">Asset</option>
            <option value="Setting">Setting</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" message="Loading audit trail records..." />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No audit log entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Actor</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log._id;
                  return (
                    <React.Fragment key={log._id}>
                      <tr 
                        onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">
                          {formatDate(log.timestamp)}
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-semibold text-white">
                            {log.actor?.name || log.actor?.email || 'System Daemon'}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase">{log.actorRole}</div>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                          <span className="text-cyan-400 font-bold">{log.entityType}</span>
                          <span className="text-slate-500 block text-[10px] truncate max-w-[120px]">
                            {log.entityId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {log.ip || '127.0.0.1'}
                        </td>

                        <td className="py-3.5 px-4 font-sans text-right">
                          <button className="text-slate-400 hover:text-white">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Before/After State Inspection */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={6} className="p-4 border-b border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                                <span className="font-bold text-amber-400 block mb-1">State Before:</span>
                                <pre className="text-slate-300 overflow-x-auto text-[11px]">
                                  {log.before ? JSON.stringify(log.before, null, 2) : 'null'}
                                </pre>
                              </div>

                              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                                <span className="font-bold text-emerald-400 block mb-1">State After:</span>
                                <pre className="text-slate-300 overflow-x-auto text-[11px]">
                                  {log.after ? JSON.stringify(log.after, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
