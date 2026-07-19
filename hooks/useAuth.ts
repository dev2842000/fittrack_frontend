'use client';

import { useState, useEffect } from 'react';
import { authApi, User } from '@/lib/auth';
import { setAccessToken, clearAccessToken } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Call /auth/me directly — interceptor handles 401 by refreshing automatically
    authApi.me()
      .then(res => setUser(res.data.user))
      .catch(() => {}) // not logged in or refresh failed — fine
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    return res.data;
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    clearAccessToken();
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
