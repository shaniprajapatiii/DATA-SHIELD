import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

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
    // In real app: call Node.js API → JWT
    const mockUser = { id: '1', email, name: email.split('@')[0], plan: 'free' };
    setUser(mockUser);
    localStorage.setItem('datashield_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const register = async (email, password, name) => {
    const mockUser = { id: Date.now().toString(), email, name, plan: 'free' };
    setUser(mockUser);
    localStorage.setItem('datashield_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('datashield_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
