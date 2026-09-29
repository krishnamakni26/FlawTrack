import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  Flame, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  ArrowUpDown, 
  ChevronRight,
  Copy,
  Server,
  RefreshCw
} from 'lucide-react';
import { vulnerabilitiesApi } from '../../api/vulnerabilities.api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { 
  formatDate, 
  formatSlaCountdown, 
  getStatusBadgeVariant, 
  getPriorityBadgeVariant 
} from '../../utils/formatters';

export const PriorityQueuePage = () => {
  const { user } = useAuth();
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [slaBreachedOnly, setSlaBreachedOnly] = useState(false);
  const [kevOnly, setKevOnly] = useState(false);
  const [sortBy, setSortBy] = useState('risk.score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState(null);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (duplicatesOnly) params.duplicatesOnly = true;
      if (slaBreachedOnly) params.slaBreached = true;

      const res = await vulnerabilitiesApi.getVulnerabilities(params);
      let list = res.data || [];
      if (kevOnly) {
        list = list.filter(v => v.threat?.inKev);
      }
      setVulnerabilities(list);
    } catch (err) {
      console.error('Failed to load priority queue:', err);
      setError(err.message || 'Failed to fetch vulnerabilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVulnerabilities();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, priorityFilter, duplicatesOnly, slaBreachedOnly, kevOnly, sortBy, sortOrder]);

  const handleAssignToMe = async (vulnId) => {
    try {
      setAssigningId(vulnId);
      await vulnerabilitiesApi.assignVulnerability(vulnId, user.id);
      fetchVulnerabilities();
    } catch (err) {
      console.error('Failed to assign:', err);
      setError(err.message || 'Assignment failed');
    } finally {
      setAssigningId(null);
    }
  };

  // Counts summary
  const p1Count = vulnerabilities.filter(v => v.risk?.priority === 'P1').length;
  const p2Count = vulnerabilities.filter(v => v.risk?.priority === 'P2').length;
  const breachedCount = vulnerabilities.filter(v => v.sla?.breached).length;
  const kevCount = vulnerabilities.filter(v => v.threat?.inKev).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-7 h-7 text-amber-500" />
            Security Priority Queue
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Triaged vulnerabilities ordered by contextual risk score (CVSS + EPSS + KEV + Asset Criticality).
          </p>
        </div>

        <button
          onClick={fetchVulnerabilities}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all self-start sm:self-auto border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Queue
        </button>
      </div>

      {/* Top Quick Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'P1' ? '' : 'P1')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            priorityFilter === 'P1' 
              ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/10' 
              : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">P1 Critical</div>
          <div className="text-2xl font-extrabold text-white mt-1">{p1Count}</div>
        </div>

        <div 
          onClick={() => setPriorityFilter(priorityFilter === 'P2' ? '' : 'P2')}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            priorityFilter === 'P2' 
              ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10' 
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">P2 High</div>
          <div className="text-2xl font-extrabold text-white mt-1">{p2Count}</div>
        </div>

        <div 
          onClick={() => setSlaBreachedOnly(!slaBreachedOnly)}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            slaBreachedOnly 
              ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/10' 
              : 'bg-slate-900/80 border-slate-800 hover:border-red-500/40'
          }`}
        >
          <div className="text-xs text-red-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> SLA Breached
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{breachedCount}</div>
        </div>

        <div 
          onClick={() => setKevOnly(!kevOnly)}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            kevOnly 
              ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/10' 
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3" /> CISA KEV Exploited
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{kevCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, CVE, description, asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VALIDATION">Under Validation</option>
              <option value="VALIDATED">Validated</option>
              <option value="PRIORITIZED">Prioritized</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="RETEST">Retest</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
              <option value="DUPLICATE">Duplicate</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Priorities</option>
              <option value="P1">P1 - Critical (70-100)</option>
              <option value="P2">P2 - High (50-69)</option>
              <option value="P3">P3 - Medium (30-49)</option>
              <option value="P4">P4 - Low (&lt;30)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={duplicatesOnly}
              onChange={(e) => setDuplicatesOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Duplicate Candidates Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={slaBreachedOnly}
              onChange={(e) => setSlaBreachedOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-red-400 font-medium">SLA Breached Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={kevOnly}
              onChange={(e) => setKevOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-purple-400 font-medium">In CISA KEV Catalog</span>
          </label>

          <div className="ml-auto flex items-center gap-2 text-slate-400">
            <span>Sort by:</span>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
            >
              <option value="risk.score:desc">Risk Score (Highest)</option>
              <option value="risk.score:asc">Risk Score (Lowest)</option>
              <option value="sla.dueAt:asc">SLA Due Date (Urgent)</option>
              <option value="createdAt:desc">Recently Reported</option>
              <option value="cvss.baseScore:desc">CVSS Score (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Queue Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" message="Loading priority queue..." />
          </div>
        ) : vulnerabilities.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300">No vulnerabilities found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              No items match the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Priority & Score</th>
                  <th className="py-3.5 px-4 font-semibold">Vulnerability Title</th>
                  <th className="py-3.5 px-4 font-semibold">Threat Intel</th>
                  <th className="py-3.5 px-4 font-semibold">Target Asset</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">SLA Countdown</th>
                  <th className="py-3.5 px-4 font-semibold">Assignee</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {vulnerabilities.map((vuln) => {
                  const slaInfo = formatSlaCountdown(vuln.sla?.dueAt, vuln.sla?.breached);
                  const riskScore = vuln.risk?.score || 0;
                  const priority = vuln.risk?.priority || 'P4';

                  return (
                    <tr 
                      key={vuln._id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        vuln.sla?.breached ? 'bg-red-500/5' : ''
                      }`}
                    >
                      {/* Priority & Score */}
                      <td className="py-4 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityBadgeVariant(priority)} size="md">
                            {priority}
                          </Badge>
                          <div className="w-14">
                            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-0.5">
                              <span>Score</span>
                              <span className="font-bold text-white">{riskScore.toFixed(0)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  priority === 'P1' ? 'bg-rose-500' :
                                  priority === 'P2' ? 'bg-amber-500' :
                                  priority === 'P3' ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Title & Metadata */}
                      <td className="py-4 px-4 font-sans max-w-xs">
                        <Link 
                          to={`/vulnerabilities/${vuln._id}`}
                          className="font-semibold text-white hover:text-cyan-400 transition-colors block truncate"
                          title={vuln.title}
                        >
                          {vuln.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {vuln.cveId && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-800/40">
                              {vuln.cveId}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {vuln.category}
                          </span>
                          {vuln.duplicate?.isPotentialDuplicate && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Copy className="w-2.5 h-2.5" /> DUP
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Threat Intel */}
                      <td className="py-4 px-4 font-sans">
                        <div className="space-y-1">
                          {vuln.threat?.inKev ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              <Flame className="w-3 h-3 text-rose-400" /> CISA KEV
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">Not in KEV</span>
                          )}
                          {vuln.threat?.epss !== undefined && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              EPSS: <span className="text-cyan-300 font-semibold">{(vuln.threat.epss * 100).toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Target Asset */}
                      <td className="py-4 px-4 font-sans">
                        {vuln.asset ? (
                          <div>
                            <div className="font-medium text-slate-200 text-xs flex items-center gap-1">
                              <Server className="w-3 h-3 text-slate-400" />
                              {vuln.asset.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                              <span className="capitalize">{vuln.asset.environment}</span>
                              <span>•</span>
                              <span>Crit: {vuln.asset.criticality}/5</span>
                              {vuln.asset.internetFacing && (
                                <span className="text-rose-400 font-semibold">Public</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 font-sans">
                        <Badge variant={getStatusBadgeVariant(vuln.status)}>
                          {vuln.status.replace('_', ' ')}
                        </Badge>
                      </td>

                      {/* SLA Countdown */}
                      <td className="py-4 px-4 font-sans">
                        {vuln.sla?.dueAt ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${slaInfo.className}`}>
                            <Clock className="w-3 h-3" />
                            {slaInfo.text}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs italic">No SLA set</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="py-4 px-4 font-sans">
                        {vuln.assignedTo ? (
                          <div className="text-xs text-slate-200 font-medium truncate max-w-[120px]">
                            {vuln.assignedTo.name || vuln.assignedTo.email}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAssignToMe(vuln._id)}
                            disabled={assigningId === vuln._id}
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            <UserCheck className="w-3 h-3" />
                            Assign to me
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 font-sans text-right">
                        <Link
                          to={`/vulnerabilities/${vuln._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
                        >
                          Triage <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
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
