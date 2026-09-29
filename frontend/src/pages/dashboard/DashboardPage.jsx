import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Copy, 
  Server,
  Layers,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { dashboardApi } from '../../api/resources.api';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { PriorityDonut } from '../../components/dashboard/PriorityDonut';
import { StatusFunnel } from '../../components/dashboard/StatusFunnel';
import { TrendLineChart } from '../../components/dashboard/TrendLineChart';
import { RiskyAssetsTable } from '../../components/dashboard/RiskyAssetsTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { formatSlaCountdown, getPriorityBadgeVariant } from '../../utils/formatters';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getSummary();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      // axiosClient normalizes errors to {code, message} before rejecting
      setError(err.message || 'Failed to fetch executive dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <LoadingSpinner size="lg" message="Aggregating security intelligence & SLA metrics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Dashboard Telemetry Unavailable</h3>
        <p className="text-xs text-red-300">{error || 'Could not load summary metrics.'}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalVulnerabilities = data.kpis?.totalCount ?? data.totalVulnerabilities ?? 0;
  const openVulnerabilities = data.kpis?.openCount ?? data.openVulnerabilities ?? 0;
  const countsByPriority = data.priorityCounts || data.countsByPriority || {};
  const countsByStatus = data.statusCounts || data.countsByStatus || {};
  const slaCompliance = data.kpis?.slaCompliancePercent ?? data.slaCompliance ?? 100;
  const breachedCount = data.kpis?.breachedCount ?? data.breachedCount ?? 0;
  const overdueList = data.overdueList || [];
  const meanTimeToRemediate = data.mttrByPriority || data.meanTimeToRemediate || {};
  const trend = data.weeklyTrend || data.trend || [];
  const riskyAssets = data.topRiskyAssets || data.riskyAssets || [];
  const topCategories = data.topCategories || [];
  const duplicateRate = data.kpis?.duplicateRate ?? data.duplicateRate ?? 0;
  const kevCount = data.kpis?.inKevCount ?? data.kevCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-cyan-400" />
            Security Posture & Operations Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analytics, SLA compliance monitoring, and threat-aware vulnerability prioritization.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Active Open"
          value={openVulnerabilities}
          icon={Layers}
          color="cyan"
          subtitle={`Total: ${totalVulnerabilities}`}
        />
        <MetricCard
          title="P1 Critical"
          value={countsByPriority.P1 || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Immediate Action"
        />
        <MetricCard
          title="SLA Compliance"
          value={`${slaCompliance}%`}
          icon={Clock}
          color={slaCompliance >= 90 ? 'emerald' : slaCompliance >= 75 ? 'amber' : 'rose'}
          subtitle={`${breachedCount} Breaches`}
        />
        <MetricCard
          title="CISA KEV Exploited"
          value={kevCount}
          icon={Flame}
          color="purple"
          subtitle="Wild Exploits"
        />
        <MetricCard
          title="Mean Remediation"
          value={meanTimeToRemediate.P1 ? `${meanTimeToRemediate.P1}h` : '18h'}
          icon={TrendingUp}
          color="blue"
          subtitle="P1 Target: 24h"
        />
        <MetricCard
          title="Duplicate Rate"
          value={`${duplicateRate}%`}
          icon={Copy}
          color="amber"
          subtitle="NLP Filtered"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Donut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <PriorityDonut data={countsByPriority} />
        </div>

        {/* Status Funnel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <StatusFunnel data={countsByStatus} />
        </div>

        {/* Weekly Ingestion Trend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <TrendLineChart data={trend} />
        </div>
      </div>

      {/* Bottom Grid: Risky Assets & Overdue Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risky Assets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <RiskyAssetsTable assets={riskyAssets} />
        </div>

        {/* SLA Breached & Overdue Watchlist */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              SLA Breached / Overdue Watchlist
            </h3>
            <span className="text-xs text-red-400 font-mono font-semibold">
              {overdueList.length} items overdue
            </span>
          </div>

          {overdueList.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-300">All SLAs in Compliance</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                No active vulnerabilities are currently breaching their remediation deadline.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {overdueList.map((item) => {
                const sla = formatSlaCountdown(item.sla?.dueAt, true);
                return (
                  <div
                    key={item._id}
                    className="p-3 bg-slate-950 border border-red-500/20 rounded-xl flex items-center justify-between hover:border-red-500/40 transition-colors"
                  >
                    <div className="truncate mr-3">
                      <Link
                        to={`/vulnerabilities/${item._id}`}
                        className="text-xs font-bold text-white hover:text-cyan-400 transition-colors block truncate"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        {item.cveId && (
                          <span className="font-mono text-cyan-400">{item.cveId}</span>
                        )}
                        <span>•</span>
                        <span>{item.asset?.name || 'Asset N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={getPriorityBadgeVariant(item.risk?.priority || 'P1')}>
                        {item.risk?.priority || 'P1'}
                      </Badge>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {sla.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
