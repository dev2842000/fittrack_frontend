'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface Summary {
  totalWorkouts: number;
  topLifts: { exercise_name: string; max_weight: number }[];
}

interface MonthActivity {
  workoutCount: number;
}

interface GoalData {
  weeklyTarget: number | null;
  thisWeek: number;
  achieved: boolean;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface MuscleData {
  muscle_group: string;
  sessions: number;
}

// Circular SVG progress ring component
function CircularProgress({ value, max, size = 96, strokeWidth = 8 }: { value: number; max: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(1, value / max) : 0;
  const offset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold text-gray-900 dark:text-white leading-none">{value}</span>
        <span className="text-[10px] text-gray-400 leading-tight">/ {max}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <Dashboard />
      </div>
    </AuthGuard>
  );
}

function DashboardSkeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const now = new Date();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [weeklyMuscles, setWeeklyMuscles] = useState<MuscleData[]>([]);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [monthsData, setMonthsData] = useState<Record<number, MonthActivity>>({});
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<{ id: number; name: string | null } | null | undefined>(undefined); // undefined = not yet fetched
  const [showNameModal, setShowNameModal] = useState(false);
  const [starting, setStarting] = useState(false);

  // Build year list from 2024 to current year
  const years = Array.from(
    { length: Math.max(1, now.getFullYear() - 2025) },
    (_, i) => 2026 + i
  );

  useEffect(() => {
    Promise.all([
      api.get('/progress/summary').then(r => setSummary(r.data)).catch(() => {}),
      api.get('/goals').then(r => setGoal(r.data)).catch(() => {}),
      api.get('/progress/streaks').then(r => setStreak(r.data)).catch(() => {}),
      api.get('/workouts/active').then(r => setActiveWorkout(r.data.workout ?? null)).catch(() => setActiveWorkout(null)),
      api.get('/progress/weekly-muscles').then(r => setWeeklyMuscles(r.data.muscles)).catch(() => {}),
    ]).finally(() => setLoadingStats(false));
  }, []);

  const handleStartWorkout = async (name: string) => {
    setShowNameModal(false);
    setStarting(true);
    try {
      await api.post('/workouts', { name: name.trim() || null });
      router.push('/workout/log');
    } finally { setStarting(false); }
  };

  const fetchMonths = useCallback(async () => {
    setLoadingMonths(true);
    try {
      const r = await api.get(`/progress/months-summary?year=${selectedYear}`);
      setMonthsData(r.data.months);
    } catch {}
    finally { setLoadingMonths(false); }
  }, [selectedYear]);

  useEffect(() => { fetchMonths(); }, [fetchMonths]);

  const isFuture = (monthIndex: number) => {
    // monthIndex is 0-based
    return (
      selectedYear > now.getFullYear() ||
      (selectedYear === now.getFullYear() && monthIndex > now.getMonth())
    );
  };

  const handleMonthClick = (monthIndex: number) => {
    const month = monthsData[monthIndex + 1];
    if (!month || month.workoutCount === 0) return;
    router.push(`/progress/monthly/${selectedYear}/${monthIndex + 1}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Welcome hero card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 p-6 flex items-center justify-between gap-4 relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-6 w-36 h-36 rounded-full bg-white" />
        </div>
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-green-100 text-sm mt-1.5 font-medium">
            Ready to train? Log your sets and track your progress.
          </p>
        </div>
        {activeWorkout ? (
          <Link
            href="/workout/log"
            className="relative flex-shrink-0 px-5 py-2.5 bg-white hover:bg-green-50 text-green-600 font-bold rounded-xl text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Resume Workout
          </Link>
        ) : (
          <button
            onClick={() => setShowNameModal(true)}
            disabled={starting || activeWorkout === undefined}
            className="relative flex-shrink-0 px-5 py-2.5 bg-white hover:bg-green-50 disabled:opacity-50 text-green-600 font-bold rounded-xl text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {starting ? 'Starting...' : '▶ Start Workout'}
          </button>
        )}
      </div>

      {showNameModal && (
        <WorkoutNameModal onStart={handleStartWorkout} onCancel={() => setShowNameModal(false)} />
      )}

      {/* Streak + Goal */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Streak skeleton */}
          <div className="bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-xl p-5 flex items-center gap-5">
            <DashboardSkeleton className="w-14 h-14 bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <DashboardSkeleton className="h-3 w-28 bg-gray-700" />
              <DashboardSkeleton className="h-10 w-16 bg-gray-700" />
              <DashboardSkeleton className="h-3 w-24 bg-gray-700" />
            </div>
          </div>
          {/* Goal skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <DashboardSkeleton className="h-5 w-28" />
              <DashboardSkeleton className="h-5 w-12" />
            </div>
            <div className="flex items-center gap-5">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" style={{ width: 88, height: 88 }} />
              <div className="flex-1 space-y-2">
                <DashboardSkeleton className="h-8 w-24" />
                <DashboardSkeleton className="h-3 w-32" />
                <DashboardSkeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Streak — dark card */}
        <div className="bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-xl p-5 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-orange-400" />
          </div>
          <div className="relative flex-shrink-0 flex flex-col items-center">
            <span
              className="text-5xl leading-none"
              style={{ filter: 'drop-shadow(0 0 10px rgba(251,146,60,0.7))' }}
            >
              🔥
            </span>
            {streak && streak.currentStreak > 0 && (
              <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            )}
          </div>
          <div className="relative flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Current Streak</p>
            <p className="text-5xl font-extrabold text-white leading-tight mt-0.5">
              {streak ? streak.currentStreak : '—'}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              {streak && streak.currentStreak !== 1 ? 'days in a row' : streak?.currentStreak === 1 ? 'day in a row' : ''}
            </p>
            {streak && streak.longestStreak > 0 && (
              <p className="text-xs text-gray-500 mt-1">Best: {streak.longestStreak} days</p>
            )}
          </div>
        </div>

        {/* Weekly Goal */}
        <WeeklyGoalCard goal={goal} onSave={g => setGoal(prev => prev ? { ...prev, weeklyTarget: g } : { weeklyTarget: g, thisWeek: 0, achieved: false })} />
      </div>
      )}

      {/* Feature 9: Weekly Training Split */}
      {weeklyMuscles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">💪 This Week's Training Split</h3>
          <div className="space-y-2.5">
            {weeklyMuscles.map(m => (
              <div key={m.muscle_group} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-28 flex-shrink-0">{m.muscle_group}</span>
                <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (m.sessions / Math.max(...weeklyMuscles.map(x => x.sessions))) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-16 text-right flex-shrink-0">
                  {m.sessions} {m.sessions === 1 ? 'session' : 'sessions'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All-time stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Workouts"
          value={summary ? summary.totalWorkouts : '—'}
          href="/workout"
          icon="💪"
          accent="green"
        />
        <StatCard
          label="PRs Tracked"
          value={summary ? summary.topLifts.length : '—'}
          href="/progress"
          icon="🏆"
          accent="yellow"
        />
      </div>

      {/* Monthly calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white text-base">📅 Workout History</h2>

          {/* Year filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear(y => Math.max(2026, y - 1))}
              disabled={selectedYear <= 2026}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors text-lg"
            >‹</button>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
            <button
              onClick={() => setSelectedYear(y => Math.min(now.getFullYear(), y + 1))}
              disabled={selectedYear >= now.getFullYear()}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors text-lg"
            >›</button>
          </div>
        </div>

        {loadingMonths ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {MONTHS.map((name, i) => {
              const future   = isFuture(i);
              const activity = monthsData[i + 1];
              const active   = !future && activity && activity.workoutCount > 0;

              return (
                <button
                  key={name}
                  onClick={() => handleMonthClick(i)}
                  disabled={!active}
                  className={`
                    relative rounded-2xl p-4 text-left transition-all duration-200
                    ${future
                      ? 'bg-gray-50 dark:bg-gray-700/30 opacity-35 cursor-not-allowed'
                      : active
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 cursor-pointer'
                        : 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <p className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {name}
                  </p>

                  {active ? (
                    <div className="mt-1.5">
                      <p className="text-xs font-bold text-white/90">
                        {activity.workoutCount} <span className="font-normal text-white/70">{activity.workoutCount === 1 ? 'workout' : 'workouts'}</span>
                      </p>
                    </div>
                  ) : future ? (
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">—</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">No workouts</p>
                  )}

                  {active && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/70" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Active month
          </span>
          {' · '}Click a month to see detailed stats
        </p>
      </div>

      {/* Top lifts */}
      {loadingStats ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <DashboardSkeleton className="h-5 w-24" />
            <DashboardSkeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <DashboardSkeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : summary && summary.topLifts.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">🏋️ Top Lifts</h3>
            <Link href="/progress" className="text-xs font-semibold text-green-500 hover:text-green-600 transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {summary.topLifts.map((lift, i) => {
              const gradients = [
                'from-yellow-400/20 to-amber-500/10 border-yellow-400/30',
                'from-gray-300/20 to-gray-400/10 border-gray-400/30',
                'from-orange-400/20 to-amber-600/10 border-orange-400/30',
                'from-green-400/10 to-emerald-500/10 border-green-400/20',
                'from-green-400/10 to-emerald-500/10 border-green-400/20',
              ];
              return (
                <div
                  key={lift.exercise_name}
                  className={`text-center p-3 bg-gradient-to-br ${gradients[i] ?? gradients[4]} border rounded-2xl`}
                >
                  <p className="text-2xl">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</p>
                  <p className="text-xl font-extrabold text-green-500 mt-1.5">{Math.round(lift.max_weight)}<span className="text-sm font-semibold text-gray-400">kg</span></p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight font-medium">{lift.exercise_name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/exercises"
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl hover:scale-105 border-l-4 border-blue-400 transition-all duration-200"
        >
          <div className="text-3xl mb-3">📚</div>
          <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Exercise Library</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">52 exercises across 10 muscle groups</p>
        </Link>
        {activeWorkout ? (
          <Link
            href="/workout/log"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl hover:scale-105 border-l-4 border-green-400 transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3 flex items-center gap-2">💪 <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /></div>
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-green-500 transition-colors">Resume Workout</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activeWorkout.name || 'Workout in progress'}</p>
          </Link>
        ) : (
          <button
            onClick={() => setShowNameModal(true)}
            disabled={activeWorkout === undefined}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl hover:scale-105 border-l-4 border-green-400 transition-all duration-200 text-left disabled:opacity-60"
          >
            <div className="text-3xl mb-3">💪</div>
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-green-500 transition-colors">Start Workout</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Log sets, weight &amp; reps</p>
          </button>
        )}
        <Link
          href="/progress"
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl hover:scale-105 border-l-4 border-purple-400 transition-all duration-200"
        >
          <div className="text-3xl mb-3">📈</div>
          <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">View Progress</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Graphs &amp; personal records</p>
        </Link>
      </div>
    </div>
  );
}

function daysLeftInWeek() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...6=Sat
  // Week is Mon–Sun. Sunday is last day (day 0 = 7 relative to Mon)
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  return daysUntilSunday;
}

function WeeklyGoalCard({ goal, onSave }: { goal: GoalData | null; onSave: (n: number) => void }) {
  const left = daysLeftInWeek();
  const dayLabel = left === 0 ? 'Last day of the week!' : left === 1 ? '1 day left this week' : `${left} days left this week`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Weekly Goal</p>
          </div>
          {goal?.weeklyTarget && (
            <p className="text-[11px] text-gray-400 mt-0.5 ml-7">{dayLabel} · resets Monday</p>
          )}
        </div>
        <GoalSetter current={goal?.weeklyTarget ?? null} onSave={onSave} />
      </div>

      {!goal?.weeklyTarget ? (
        /* Empty state — new user */
        <div className="flex flex-col items-center justify-center py-5 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-3xl">🎯</div>
          <div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">No goal set yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Pick how many workouts you want<br />to hit each week (Mon–Sun)</p>
          </div>
          <GoalSetterInline onSave={onSave} />
        </div>
      ) : (
        /* Goal set — show ring + context */
        <div className="flex items-center gap-5">
          <CircularProgress value={goal.thisWeek} max={goal.weeklyTarget} size={88} strokeWidth={8} />
          <div className="flex-1">
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {goal.thisWeek} <span className="text-base font-semibold text-gray-400">/ {goal.weeklyTarget}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">workouts this week</p>
            {goal.achieved ? (
              <div className="mt-2 inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                🎉 Goal reached!
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                {goal.weeklyTarget - goal.thisWeek} more workout{goal.weeklyTarget - goal.thisWeek !== 1 ? 's' : ''} to reach your goal
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalSetterInline({ onSave }: { onSave: (n: number) => void }) {
  const [selected, setSelected] = useState(3);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/goals', { weekly_workouts: selected });
      onSave(selected);
    } finally { setSaving(false); }
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-7 gap-1.5">
        {[1,2,3,4,5,6,7].map(n => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={`aspect-square rounded-xl text-sm font-bold transition-all duration-150 ${
              selected === n
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30 scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/25"
      >
        {saving ? 'Saving...' : `Set ${selected}x / week`}
      </button>
    </div>
  );
}

function GoalSetter({ current, onSave }: { current: number | null; onSave: (n: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(current ?? 3);
  const [saving, setSaving] = useState(false);

  const handleSave = async (n: number) => {
    setSaving(true);
    try {
      await api.post('/goals', { weekly_workouts: n });
      onSave(n);
      setEditing(false);
    } finally { setSaving(false); }
  };

  if (!editing) {
    if (!current) return null; // hidden when no goal — inline setter handles it
    return (
      <button
        onClick={() => { setSelected(current ?? 3); setEditing(true); }}
        className="text-xs font-semibold text-green-500 hover:text-green-600 transition-colors px-2 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
      >
        {current ? 'Edit' : 'Set goal →'}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Set weekly goal 🎯</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">How many workouts do you want to complete each week? Resets every Monday.</p>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {[1,2,3,4,5,6,7].map(n => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`aspect-square rounded-xl text-sm font-bold transition-all duration-150 ${
                selected === n
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {selected === 1 ? '1 workout per week' : `${selected} workouts per week`}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button
            onClick={() => handleSave(selected)}
            disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/25"
          >
            {saving ? 'Saving...' : 'Save goal'}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkoutNameModal({ onStart, onCancel }: { onStart: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const suggestions = ['Chest Day', 'Back Day', 'Leg Day', 'Push Day', 'Pull Day', 'Shoulder Day', 'Arms Day', 'Full Body'];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Name your workout 💪</h3>
        <input
          autoFocus
          type="text"
          placeholder="e.g. Chest Day, Pull Day..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onStart(name)}
          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
        />
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => setName(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                name === s
                  ? 'bg-green-500 text-white border-green-500 shadow-sm shadow-green-500/30'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-500'
              }`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={() => onStart(name)} className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40">
            {name.trim() ? '▶ Start' : '▶ Start (unnamed)'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: string;
  accent?: 'green' | 'yellow';
}) {
  const accentBorder = accent === 'yellow' ? 'border-l-4 border-yellow-400' : 'border-l-4 border-green-400';
  const numColor = accent === 'yellow' ? 'text-yellow-500' : 'text-green-500';

  const content = (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex items-center gap-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ${accentBorder}`}>
      {icon && <span className="text-3xl">{icon}</span>}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-4xl font-extrabold mt-0.5 ${numColor}`}>{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
