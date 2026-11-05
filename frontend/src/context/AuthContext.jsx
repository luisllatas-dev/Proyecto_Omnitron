import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('omnitron_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPurchasesModalOpen, setIsPurchasesModalOpen] = useState(false);

  // Cargar usuario inicial si hay token
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        if (res.data?.success) {
          setUser(res.data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Sesión expirada o token inválido:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const newToken = res.data.data.token;
      localStorage.setItem('omnitron_token', newToken);
      setToken(newToken);
      setUser(res.data.data);
      setIsAuthModalOpen(false);
      return res.data.data;
    }
  };

  // Register
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      const newToken = res.data.data.token;
      localStorage.setItem('omnitron_token', newToken);
      setToken(newToken);
      setUser(res.data.data);
      setIsAuthModalOpen(false);
      return res.data.data;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('omnitron_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPurchasesModalOpen,
        setIsPurchasesModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
