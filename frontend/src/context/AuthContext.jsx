import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vt_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('vt_access_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('vt_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Token might be expired, interceptor will try refresh or log out
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      setUser(userData);
      localStorage.setItem('vt_user', JSON.stringify(userData));
      localStorage.setItem('vt_access_token', accessToken);
      localStorage.setItem('vt_refresh_token', refreshToken);
      return userData;
    }
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.success && res.data) {
      const { user: userData, accessToken, refreshToken } = res.data;
      setUser(userData);
      localStorage.setItem('vt_user', JSON.stringify(userData));
      localStorage.setItem('vt_access_token', accessToken);
      localStorage.setItem('vt_refresh_token', refreshToken);
      return userData;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('vt_user');
    localStorage.removeItem('vt_access_token');
    localStorage.removeItem('vt_refresh_token');
  };

  const isReporter = user?.role === ROLES.REPORTER;
  const isAnalyst = user?.role === ROLES.ANALYST;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isStaff = isAnalyst || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isReporter,
        isAnalyst,
        isAdmin,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
