import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SubmitVulnerabilityPage } from './pages/reporter/SubmitVulnerabilityPage';
import { MyReportsPage } from './pages/reporter/MyReportsPage';
import { PriorityQueuePage } from './pages/analyst/PriorityQueuePage';
import { VulnerabilityDetailPage } from './pages/analyst/VulnerabilityDetailPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AssetManagementPage } from './pages/admin/AssetManagementPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { JobControlPage } from './pages/admin/JobControlPage';

// Protected Route wrapper with role checks
const ProtectedLayout = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Authenticating session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized, redirect to their default home
    return <Navigate to={user.role === 'REPORTER' ? '/my-reports' : '/dashboard'} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Default index redirection based on user role
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'REPORTER') return <Navigate to="/my-reports" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Root */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Common / Reporter Routes */}
            <Route element={<ProtectedLayout allowedRoles={['REPORTER', 'ANALYST', 'ADMIN']} />}>
              <Route path="/submit" element={<SubmitVulnerabilityPage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/vulnerabilities/:id" element={<VulnerabilityDetailPage />} />
            </Route>

            {/* Analyst & Admin Routes */}
            <Route element={<ProtectedLayout allowedRoles={['ANALYST', 'ADMIN']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/queue" element={<PriorityQueuePage />} />
              <Route path="/admin/assets" element={<AssetManagementPage />} />
            </Route>

            {/* Admin-Only Routes */}
            <Route element={<ProtectedLayout allowedRoles={['ADMIN']} />}>
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/settings" element={<SystemSettingsPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
              <Route path="/admin/jobs" element={<JobControlPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
