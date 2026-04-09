'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/auth';
import { EyeIcon } from '@/components/EyeIcon';
import { btn, input } from '@/lib/theme';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}

function RegisterForm() {
  const { user, loading } = useAuth();
  const { isDark, toggle, mounted } = useDarkMode();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      await authApi.register({ name, email, password });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top strip */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="ft-display text-2xl text-green-500 tracking-wide">FITTRACK</Link>
        {mounted && (
          <button onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Hero block */}
      <div className="px-6 pt-6 pb-10">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-green-500 mb-2">Free forever</p>
        <h1 className="ft-display text-6xl sm:text-7xl text-gray-900 dark:text-white leading-none">
          START<br />TRACKING
        </h1>
        <div className="mt-4 flex flex-wrap gap-3">
          {['50+ exercises', 'PR detection', 'Weekly goals', 'Rest timer'].map(f => (
            <span key={f} className="text-xs font-semibold px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              ✓ {f}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-t-3xl px-6 pt-8 pb-10 space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">Name</label>
            <input type="text" required autoComplete="name"
              value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
              className={input.md} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">Email</label>
            <input type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className={input.md} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                className={`${input.md} pr-11`} />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className={`${btn.primary} w-full py-3.5 text-base mt-2`}>
            {submitting ? 'Sending OTP…' : 'Create account →'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">already have one?</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <Link href="/login"
          className="block w-full py-3.5 text-center border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:border-green-400 hover:text-green-500 transition-colors text-base">
          Sign in instead
        </Link>
      </div>
    </main>
  );
}
