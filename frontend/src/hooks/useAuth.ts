'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi, User } from '@/services/apiClient';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('vh_token');
      const userRaw = localStorage.getItem('vh_user');
      if (token && userRaw) {
        try {
          const user: User = JSON.parse(userRaw);
          setState({ user, token, isLoading: false, isAuthenticated: true });
        } catch {
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      } else {
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      }
    };

    checkAuth();
    window.addEventListener('auth_changed', checkAuth);
    return () => window.removeEventListener('auth_changed', checkAuth);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Мокуємо успішний логін
    const data = {
      token: 'fake-jwt-token',
      user: {
        id: '1',
        username: email.split('@')[0] || 'User',
        email,
        createdAt: new Date().toISOString()
      }
    };
    localStorage.setItem('vh_token', data.token);
    localStorage.setItem('vh_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    window.dispatchEvent(new Event('auth_changed'));
    return data;
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    // Мокуємо успішну реєстрацію
    const data = {
      token: 'fake-jwt-token',
      user: {
        id: '1',
        username,
        email,
        createdAt: new Date().toISOString()
      }
    };
    localStorage.setItem('vh_token', data.token);
    localStorage.setItem('vh_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    window.dispatchEvent(new Event('auth_changed'));
    return data;
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    // Мокуємо вхід через Google
    const data = {
      token: 'fake-jwt-token',
      user: {
        id: '1',
        username: 'GoogleUser',
        email: 'google@example.com',
        createdAt: new Date().toISOString()
      }
    };
    localStorage.setItem('vh_token', data.token);
    localStorage.setItem('vh_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    window.dispatchEvent(new Event('auth_changed'));
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vh_token');
    localStorage.removeItem('vh_user');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    window.dispatchEvent(new Event('auth_changed'));
  }, []);

  return { ...state, login, register, loginWithGoogle, logout };
}
