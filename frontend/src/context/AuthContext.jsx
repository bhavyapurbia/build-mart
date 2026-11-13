import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bm_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data?.data || res.data;
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('bm_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const payload = res.data?.data || res.data;
      const { token: newToken, user: userData } = payload;
      localStorage.setItem('bm_token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast(`Welcome back, ${userData?.name || 'Customer'}!`, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await api.post('/auth/admin-login', { email, password });
      const payload = res.data?.data || res.data;
      const { token: newToken, user: userData } = payload;
      localStorage.setItem('bm_token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast('Admin authorized successfully!', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin authentication failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const payload = res.data?.data || res.data;
      const { token: newToken, user: newUser } = payload;
      localStorage.setItem('bm_token', newToken);
      setToken(newToken);
      setUser(newUser);
      showToast('Account registered successfully!', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('bm_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      const payload = res.data?.data || res.data;
      setUser(payload.user || payload);
      showToast('Profile updated!', 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: ['admin', 'manager', 'support'].includes(user?.role),
    isSuperAdmin: user?.role === 'admin',
    userRole: user?.role || 'guest',
    login,
    adminLogin,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
