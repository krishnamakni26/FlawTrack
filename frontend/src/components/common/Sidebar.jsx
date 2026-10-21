import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShieldAlert,
  FilePlus2,
  Files,
  FileText,
  Server,
  Users,
  Sliders,
  History,
  Terminal,
} from 'lucide-react';

export const Sidebar = () => {
  const { isReporter, isAnalyst, isAdmin, isStaff } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
    }`;

  return (
    <aside className="w-64 bg-[#080d18] border-r border-slate-800/80 p-4 flex flex-col justify-between h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* Reporter Section */}
        {isReporter && (
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2 font-semibold">
              Reporting Portal
            </div>
            <nav className="space-y-1">
              <NavLink to="/submit" className={linkClass}>
                <FilePlus2 className="w-4 h-4 text-cyan-400" />
                <span>Submit Vulnerability</span>
              </NavLink>
              <NavLink to="/my-reports" className={linkClass}>
                <Files className="w-4 h-4" />
                <span>My Reports</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Security Analyst & Admin Section */}
        {isStaff && (
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2 font-semibold">
              Operations & Triage
            </div>
            <nav className="space-y-1">
              <NavLink to="/dashboard" className={linkClass}>
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/queue" className={linkClass}>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Priority Queue</span>
              </NavLink>
              <NavLink to="/reports" className={linkClass}>
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Reports & Exports</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Management Section */}
        {isAdmin && (
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2 font-semibold">
              Governance & Admin
            </div>
            <nav className="space-y-1">
              <NavLink to="/assets" className={linkClass}>
                <Server className="w-4 h-4" />
                <span>Asset Inventory</span>
              </NavLink>
              <NavLink to="/users" className={linkClass}>
                <Users className="w-4 h-4" />
                <span>User Directory</span>
              </NavLink>
              <NavLink to="/settings" className={linkClass}>
                <Sliders className="w-4 h-4" />
                <span>Risk & SLA Settings</span>
              </NavLink>
              <NavLink to="/audit" className={linkClass}>
                <History className="w-4 h-4" />
                <span>Audit Logs</span>
              </NavLink>
              <NavLink to="/jobs" className={linkClass}>
                <Terminal className="w-4 h-4" />
                <span>Job Operations</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* System Status Footnote */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Engine Active
        </span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
};
