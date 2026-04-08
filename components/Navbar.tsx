'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/NotificationBell';
import { useDarkMode } from '@/hooks/useDarkMode';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function HomeIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M5 10v11h14V10"/>
    </svg>
  );
}

function HistoryIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm-1 5v5.414l3.293 3.293-1.414 1.414L10 14.586V8h2z"/></svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
    </svg>
  );
}

function TemplatesIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v1.5H8V17zm0-3h8v1.5H8V14zm0-3h5v1.5H8V11z"/></svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
  );
}

function ProgressIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M5 19h2v-7H5v7zm4 0h2V5H9v14zm4 0h2v-10h-2v10zm4 0h2v-4h-2v4z"/></svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function ProfileIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z"/></svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

const links = [
  { href: '/dashboard', label: 'Home', Icon: HomeIcon },
  { href: '/workout', label: 'History', Icon: HistoryIcon },
  { href: '/templates', label: 'Templates', Icon: TemplatesIcon },
  { href: '/progress', label: 'Progress', Icon: ProgressIcon },
  { href: '/profile', label: 'Profile', Icon: ProfileIcon },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggle, mounted } = useDarkMode();

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
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(href)
                      ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={toggle}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            )}
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
          {links.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${
                  active ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-green-500 rounded-full" />
                )}
                <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  <Icon filled={active} />
                </span>
                <span className={`text-[11px] font-semibold ${active ? 'text-green-500' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom padding so content isn't hidden behind tab bar on mobile */}
      {/* <div className="sm:hidden h-20" /> */}
    </>
  );
}
