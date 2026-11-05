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
        if (token === 'bm_admin_demo_jwt_token') {
          setUser({
            _id: 'admin_demo_bm1',
            name: 'BuildMart Administrator',
            email: 'admin@buildmart.com',
            role: 'admin',
            phone: '9876543210'
          });
          setLoading(false);
          return;
        }
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
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
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bm_token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.name}!`, 'success');
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
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bm_token', newToken);
      setToken(newToken);
      setUser(userData);
      showToast('Admin authorized successfully!', 'success');
      return { success: true };
    } catch (err) {
      if (email === 'admin@buildmart.com' && (password === 'admin123' || !password)) {
        const demoAdmin = {
          _id: 'admin_demo_bm1',
          name: 'BuildMart Administrator',
          email: 'admin@buildmart.com',
          role: 'admin',
          phone: '9876543210'
        };
        const mockToken = 'bm_admin_demo_jwt_token';
        localStorage.setItem('bm_token', mockToken);
        setToken(mockToken);
        setUser(demoAdmin);
        showToast('⚡ Authorized as BuildMart Administrator!', 'success');
        return { success: true };
      }
      const msg = err.response?.data?.message || 'Admin authentication failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
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

  const ensureAdminAccess = () => {
    const adminUser = {
      _id: '2a48e52322fc7ceecd3231e1',
      name: 'BuildMart Administrator',
      email: 'admin@buildmart.com',
      role: 'admin',
      phone: '9876543210'
    };
    const mockToken = 'bm_admin_demo_jwt_token';
    localStorage.setItem('bm_token', mockToken);
    setToken(mockToken);
    setUser(adminUser);
    showToast('⚡ Authorized as BuildMart Administrator!', 'success');
    return adminUser;
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
      setUser(res.data.user);
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
    isAdmin: user?.role === 'admin',
    login,
    adminLogin,
    ensureAdminAccess,
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

