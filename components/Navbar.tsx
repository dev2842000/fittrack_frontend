'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/NotificationBell';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/exercises', label: 'Exercises' },
  { href: '/workout', label: 'History' },
  { href: '/progress', label: 'Progress' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-lg font-extrabold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent tracking-tight"
          >
            FitTrack
          </Link>
          <div className="hidden sm:flex gap-1">
            {links.map(link => {
              const isActive =
                pathname === link.href ||
                (link.href === '/workout' && pathname.startsWith('/workout'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href="/profile"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              pathname === '/profile'
                ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:block">{user?.name}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors duration-200 px-2 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
