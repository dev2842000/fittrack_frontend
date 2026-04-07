'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/NotificationBell';

const links = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/workout', label: 'History', icon: '🏋️' },
  { href: '/templates', label: 'Templates', icon: '📋' },
  { href: '/progress', label: 'Progress', icon: '📈' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href === '/workout' && pathname.startsWith('/workout'));

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-lg font-extrabold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent tracking-tight"
            >
              FitTrack
            </Link>
            {/* Desktop nav links */}
            <div className="hidden sm:flex gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            {/* Profile avatar — desktop only */}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <span>{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="hidden sm:block text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Sign out
            </button>
            {/* Mobile: avatar only */}
            <Link
              href="/profile"
              className="sm:hidden w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-sm font-bold text-white shadow-sm"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 pb-safe">
        <div className="flex items-center justify-around h-20">
          {links.map(link => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${
                  active ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-green-500 rounded-full" />
                )}
                <span className={`text-3xl leading-none transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {link.icon}
                </span>
                <span className={`text-xs font-semibold ${active ? 'text-green-500' : ''}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom padding so content isn't hidden behind tab bar on mobile */}
      <div className="sm:hidden h-20" />
    </>
  );
}
