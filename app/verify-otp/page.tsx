'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, saveToken } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

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
    if (otp.length < 6) {
      setError('Enter all 6 digits');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.verifyOtp({ email, otp });
      saveToken(res.data.token);
      router.push('/dashboard');
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-500">FitTrack</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Verify your email</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We sent a 6-digit code to
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">{email}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          {resendMsg && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg text-center">
              {resendMsg}
            </div>
          )}

          {/* OTP digit boxes */}
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
                className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || digits.join('').length < 6}
            className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Didn't get it?{' '}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-green-500 hover:underline font-medium disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </p>
      </div>
    </main>
  );
}
