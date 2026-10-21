import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'REPORTER') {
        navigate('/my-reports');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#06090e] relative overflow-hidden">
      {/* Background ambient cybersecurity lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 items-center justify-center shadow-xl shadow-cyan-500/25 mb-4">
            <Shield className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            FlawTrack
          </h1>
          <p className="text-xs font-mono text-cyan-400/90 uppercase tracking-widest mt-1">
            Smart Vulnerability Management System
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-700/80 shadow-2xl">
          <h2 className="text-base font-bold text-slate-100 font-mono mb-6">
            Authentication Required
          </h2>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@flawtrack.local"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs uppercase font-mono tracking-wider hover:opacity-95 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Security Console'}
            </button>
          </form>

          {/* Quick Login Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-3">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Quick-Fill Accounts:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@flawtrack.local', 'Password123!')}
                className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition text-left"
              >
                <div className="font-bold text-red-400">ADMIN</div>
                <div className="text-[10px] text-slate-500 truncate">admin@flawtrack.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('analyst1@flawtrack.local', 'Password123!')}
                className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition text-left"
              >
                <div className="font-bold text-cyan-400">ANALYST 1</div>
                <div className="text-[10px] text-slate-500 truncate">analyst1@flawtrack.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('analyst2@flawtrack.local', 'Password123!')}
                className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition text-left"
              >
                <div className="font-bold text-cyan-400">ANALYST 2</div>
                <div className="text-[10px] text-slate-500 truncate">analyst2@flawtrack.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('reporter1@flawtrack.local', 'Password123!')}
                className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition text-left"
              >
                <div className="font-bold text-amber-400">REPORTER</div>
                <div className="text-[10px] text-slate-500 truncate">reporter1@flawtrack.local</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs font-mono text-slate-400">
            Need an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:underline">
              Register as Security Reporter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
