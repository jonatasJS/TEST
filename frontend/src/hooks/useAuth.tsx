import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../config/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
  address?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  profileImage?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está logado ao iniciar a aplicação (recuperar cookies HttpOnly)
  const checkSession = async () => {
    try {
      const data = await apiFetch<{ user: User }>('/auth/me');
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (e) {
      // Sem cookie ou sessão expirada, apenas manter deslogado
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro ao deslogar no backend:', error);
    } finally {
      setUser(null);
      setLoading(false);
      // Opcional: recarregar a página para limpar caches globais
      window.location.href = '/';
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
