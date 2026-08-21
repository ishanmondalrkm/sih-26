import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('civicpulse_token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('civicpulse_token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { identifier, password },
        { withCredentials: true }
      );
      if (res.data && res.data.user) {
        setUser(res.data.user);
        if (res.data.user.token) {
          localStorage.setItem('civicpulse_token', res.data.user.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.user.token}`;
        }
        return { success: true, user: res.data.user };
      }
      return { success: false, error: 'User data not found in response.' };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid login credentials.';
      return { success: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        userData,
        { withCredentials: true }
      );
      if (res.data && res.data.user) {
        setUser(res.data.user);
        if (res.data.user.token) {
          localStorage.setItem('civicpulse_token', res.data.user.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.user.token}`;
        }
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed.';
      return { success: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('civicpulse_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}