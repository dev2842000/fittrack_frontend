'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-green-500">FitTrack</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
            Track your workouts & crush your goals
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-center"
          >
            Get started — it's free
          </Link>
          <Link
            href="/login"
            className="w-full py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors text-center"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600">
          Milestone 2 — Auth complete
        </p>
      </div>
    </main>
  );
}
