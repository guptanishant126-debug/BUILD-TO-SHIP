import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aegis_token') || null);
  const [loading, setLoading] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(() => {
    return localStorage.getItem('aegis_emergency_mode') === 'true';
  });

  const fetchUserProfile = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await axiosInstance.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('Failed to restore user session:', err);
      // If invalid token, clear
      localStorage.removeItem('aegis_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('aegis_token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await axiosInstance.post('/auth/register', formData);
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('aegis_token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('aegis_token');
    setToken(null);
    setUser(null);
  };

  const updateSettings = async (settings) => {
    const res = await axiosInstance.put('/auth/settings', settings);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const setLanguage = async (newLang) => {
    if (user) {
      try {
        await updateSettings({ preferred_language: newLang });
      } catch (e) {
        console.warn('Could not sync language with server:', e);
      }
    }
    setUser(prev => prev ? { ...prev, preferred_language: newLang } : null);
  };

  const toggleEmergencyMode = () => {
    setEmergencyMode(prev => {
      const next = !prev;
      localStorage.setItem('aegis_emergency_mode', next.toString());
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      loading,
      login,
      register,
      logout,
      updateSettings,
      setLanguage,
      emergencyMode,
      toggleEmergencyMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

