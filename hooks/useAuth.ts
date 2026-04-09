'use client';

import { useState, useEffect } from 'react';
import { authApi, saveToken, removeToken, getToken, User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(res => setUser(res.data.user))
      .catch((err) => {
        // Only invalidate the token on 401 (expired/invalid).
        // Network errors and 5xx (e.g. server waking up on Render) should NOT
        // wipe the token — the user is still authenticated, the server is just slow.
        if (err?.response?.status === 401) removeToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    saveToken(res.data?.token || '');
    setUser(res.data?.user || null);
    return res.data;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    return res.data;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
