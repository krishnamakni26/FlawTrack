import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Shield, Bell, LogOut, CheckCheck, User as UserIcon } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090e1a]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent font-mono">
            VulnTrack
          </span>
          <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
            Enterprise SecOps
          </span>
        </div>
      </div>

      {/* Right Action Icons: Notification bell, user profile, logout */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center ring-2 ring-cyber-950 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-700/80">
              <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 text-xs transition cursor-pointer hover:bg-slate-800/50 ${
                        !n.read ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-200">
                          {n.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        {user && (
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-slate-200">{user.name}</div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                {user.role}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
