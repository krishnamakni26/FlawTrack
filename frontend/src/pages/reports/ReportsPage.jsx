import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { reportsApi, triggerDownload } from '../../api/reports.api';
import { dashboardApi } from '../../api/resources.api';
import { VULN_STATUSES, PRIORITIES } from '../../utils/constants';

export const ReportsPage = () => {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    from: '',
    to: '',
  });

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [activeDownload, setActiveDownload] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await dashboardApi.getSummary();
      setSummary(res.data || res);
    } catch (err) {
      console.error('Failed to load summary stats:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDownloadSummary = async (format) => {
    const key = `summary-${format}`;
    try {
      setActiveDownload(key);
      setErrorMsg('');
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `FlawTrack_Summary_Report_${dateStr}.${format}`;
      const data = await reportsApi.getSummaryReport(filters, format);
      triggerDownload(data, filename);
      showToast(`Downloaded Executive Summary (${format.toUpperCase()}) successfully`);
    } catch (err) {
      console.error('Download summary failed:', err);
      setErrorMsg(`Failed to generate summary ${format.toUpperCase()}: ${err.message || 'Server error'}`);
    } finally {
      setActiveDownload(null);
    }
  };

  const handleDownloadSla = async (format) => {
    const key = `sla-${format}`;
    try {
      setActiveDownload(key);
      setErrorMsg('');
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `FlawTrack_SLA_Report_${dateStr}.${format}`;
      const data = await reportsApi.getSlaReport(format);
      triggerDownload(data, filename);
      showToast(`Downloaded SLA Compliance Report (${format.toUpperCase()}) successfully`);
    } catch (err) {
      console.error('Download SLA report failed:', err);
      setErrorMsg(`Failed to generate SLA ${format.toUpperCase()}: ${err.message || 'Server error'}`);
    } finally {
      setActiveDownload(null);
    }
  };

  const handleResetFilters = () => {
    setFilters({ status: '', priority: '', from: '', to: '' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            Security & Compliance Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate executive vulnerability summaries, SLA audits, and forensic documentation.
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/80 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick KPI Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Total Vulnerabilities</div>
          <div className="text-2xl font-bold text-white mt-1">
            {summary?.totalCount ?? (loadingSummary ? '...' : 0)}
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">P1 Critical Vulnerabilities</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {summary?.priorityCounts?.P1 ?? (loadingSummary ? '...' : 0)}
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">SLA Compliance</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {summary?.slaCompliancePercent !== undefined ? `${summary.slaCompliancePercent}%` : (loadingSummary ? '...' : '100%')}
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">SLA Breached Items</div>
          <div className="text-2xl font-bold text-rose-500 mt-1">
            {summary?.breachedCount ?? (loadingSummary ? '...' : 0)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            Report Export Filters
          </h2>
          {(filters.status || filters.priority || filters.from || filters.to) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Priority filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority Tier</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Priorities</option>
              {Object.values(PRIORITIES).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Workflow Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Statuses</option>
              {Object.values(VULN_STATUSES).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Created From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Created To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Reports Generation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Executive Summary Report Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Executive Summary Report</h3>
              <p className="text-sm text-slate-400 mt-1">
                Comprehensive security leadership report featuring risk distribution charts, CVSS vs. FlawTrack contextual tier comparison, SLA metrics, and top 10 risks.
              </p>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Totals broken down by workflow status and priority tier</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Alert fatigue reduction analysis (CVSS-only vs FlawTrack formula)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>NLP duplicate detection efficiency metrics</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Vector graphic bar charts embedded via PDFKit</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => handleDownloadSummary('pdf')}
              disabled={activeDownload === 'summary-pdf'}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/10 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {activeDownload === 'summary-pdf' ? 'Generating PDF...' : 'Download PDF Summary'}
            </button>
            <button
              onClick={() => handleDownloadSummary('csv')}
              disabled={activeDownload === 'summary-csv'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {activeDownload === 'summary-csv' ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* 2. SLA Compliance Audit Report Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">SLA Compliance & Overdue Audit</h3>
              <p className="text-sm text-slate-400 mt-1">
                Auditor-ready compliance document detailing contractual SLA targets by priority, warning thresholds, overdue remediations, and operational compliance percentages.
              </p>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Tier targets: P1 (24h), P2 (72h), P3 (168h), P4 (720h)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Items currently exceeding contractual remediation deadlines</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>At-risk items approaching 75% elapsed window warning threshold</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Assignee ownership and tracking accountability matrix</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => handleDownloadSla('pdf')}
              disabled={activeDownload === 'sla-pdf'}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/10 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {activeDownload === 'sla-pdf' ? 'Generating PDF...' : 'Download SLA PDF'}
            </button>
            <button
              onClick={() => handleDownloadSla('csv')}
              disabled={activeDownload === 'sla-csv'}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {activeDownload === 'sla-csv' ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
