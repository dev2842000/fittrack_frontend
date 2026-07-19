'use client';

import { useState, useEffect } from 'react';
import { authApi, User } from '@/lib/auth';
import { setAccessToken, clearAccessToken, getAccessToken } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getAccessToken()) {
      // Token already in memory (e.g. just logged in, client-side nav) — skip refresh
      authApi.me()
        .then(res => setUser(res.data.user))
        .finally(() => setLoading(false));
      return;
    }
    // No token in memory — page reload scenario, restore session via cookie
    authApi.refresh()
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return authApi.me();
      })
      .then(res => setUser(res.data.user))
      .catch(() => {})
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
