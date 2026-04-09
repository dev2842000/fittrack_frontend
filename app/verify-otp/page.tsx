'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi, saveToken } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { btn } from '@/lib/theme';

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}

function VerifyOtpForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (!email) router.replace('/register');
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.verifyOtp({ email, otp });
      saveToken(res.data.token);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendMsg('');
    setError('');
    try {
      await authApi.resendOtp({ email });
      setResendMsg('New OTP sent!');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="px-6 py-4">
        <Link href="/" className="ft-display text-2xl text-green-500 dark:text-green-400 tracking-wide">
          FITTRACK
        </Link>
      </div>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Brand header */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative">
                <p className="text-5xl mb-2">📬</p>
                <h1 className="ft-display text-4xl text-white tracking-wide">Check Email</h1>
                <p className="text-green-100 text-sm mt-1">
                  Code sent to <span className="font-semibold text-white">{email}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 text-center">
                  {error}
                </div>
              )}
              {resendMsg && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm p-3 rounded-xl border border-green-100 dark:border-green-800 text-center">
                  {resendMsg}
                </div>
              )}

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-11 h-13 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || digits.join('').length < 6}
                className={`${btn.primary} w-full py-3`}
              >
                {submitting ? 'Verifying…' : 'Verify email'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Didn't get it?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-green-500 hover:text-green-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
