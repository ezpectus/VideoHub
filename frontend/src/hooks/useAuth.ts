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
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('vh_token', data.token);
    localStorage.setItem('vh_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    return data;
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { data } = await authApi.register(username, email, password);
    localStorage.setItem('vh_token', data.token);
    localStorage.setItem('vh_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    return data;
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { data } = await authApi.googleLogin(credential);
    localStorage.setItem('vh_token', data.token);
    localStorage.setItem('vh_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vh_token');
    localStorage.removeItem('vh_user');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  return { ...state, login, register, loginWithGoogle, logout };
}
