'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Navbar skeleton */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-700/60 h-14" />
        {/* Content skeleton */}
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          </div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
