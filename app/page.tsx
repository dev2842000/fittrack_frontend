import Link from 'next/link';
import AuthRedirect from './AuthRedirect';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <AuthRedirect />
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-5xl font-extrabold text-green-500 tracking-tight">FitTrack</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg font-medium">
            Track workouts · Hit PRs · Reach your goals
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📅', label: 'Log Workouts' },
            { icon: '📈', label: 'Track Progress' },
            { icon: '🎯', label: 'Weekly Goals' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:scale-105 active:scale-95 text-center"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="w-full py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-center"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-gray-400">© {new Date().getFullYear()} FitTrack. All rights reserved.</p>
      </div>
    </main>
  );
}
