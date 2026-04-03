import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../utils/api';

export const AuthContext = createContext(null);

function broadcastAuthToken(token) {
  if (!token || typeof window === 'undefined') return;

  window.postMessage(
    {
      source: 'datashield-app',
      type: 'DATASHIELD_AUTH_TOKEN',
      token,
    },
    window.location.origin
  );
}

function getApiErrorMessage(err, fallback) {
  const responseData = err?.response?.data;

  if (responseData?.error) {
    return responseData.error;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join('. ');
  }

  return err?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('datashield_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await loginUser(email, password);
      const nextUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        plan: data.user.plan || 'free',
        token: data.token,
      };

      setUser(nextUser);
      localStorage.setItem('datashield_user', JSON.stringify(nextUser));
      broadcastAuthToken(nextUser.token);
      return nextUser;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Authentication failed'));
    }
  };

  const register = async (email, password, name) => {
    try {
      const { data } = await registerUser(email, password, name);
      const nextUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        plan: data.user.plan || 'free',
        token: data.token,
      };

      setUser(nextUser);
      localStorage.setItem('datashield_user', JSON.stringify(nextUser));
      broadcastAuthToken(nextUser.token);
      return nextUser;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Registration failed'));
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('datashield_user');
    broadcastAuthToken('');
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
