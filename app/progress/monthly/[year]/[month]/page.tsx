'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

const MUSCLE_COLORS = [
  '#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#f97316','#ec4899','#14b8a6','#6366f1',
];

interface MonthlyWorkout {
  id: number;
  date: string;
  durationMin: number;
  exerciseCount: number;
  setCount: number;
}

interface MonthlyData {
  workouts: MonthlyWorkout[];
  muscleBreakdown: { muscle_group: string; set_count: number }[];
  summary: { totalWorkouts: number; totalSets: number };
}

function workoutAccentClass(name: string | null) {
  if (!name) return 'border-l-4 border-green-400';
  const l = name.toLowerCase();
  if (l.includes('push') || l.includes('chest') || l.includes('shoulder')) return 'border-l-4 border-blue-400';
  if (l.includes('pull') || l.includes('back') || l.includes('bicep')) return 'border-l-4 border-purple-400';
  if (l.includes('leg') || l.includes('squat') || l.includes('glute')) return 'border-l-4 border-orange-400';
  return 'border-l-4 border-green-400';
}

export default function MonthlyDetailPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <MonthlyDetail />
      </div>
    </AuthGuard>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

function MonthlyDetail() {
  const { year, month } = useParams();
  const router = useRouter();
  const [data, setData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);

  const y = parseInt(year as string);
  const m = parseInt(month as string);

  useEffect(() => {
    api.get(`/progress/monthly?year=${y}&month=${m}`)
      .then(r => setData(r.data))
      .catch(() => router.replace('/dashboard'))
      .finally(() => setLoading(false));
  }, [y, m, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Gradient header skeleton */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/30 animate-pulse flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-white/30 rounded-xl animate-pulse" />
              <div className="h-4 w-32 bg-white/30 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
        {/* Summary stat cards skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        {/* Chart card skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
            <div className="h-4 w-24 bg-white/30 rounded-xl animate-pulse" />
          </div>
          <div className="p-5">
            <Skeleton className="h-52 w-full" />
          </div>
        </div>
        {/* Session list skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
            <div className="h-4 w-20 bg-white/30 rounded-xl animate-pulse" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const daysInMonth = new Date(y, m, 0).getDate();
  const dailyMap: Record<number, MonthlyWorkout> = {};
  data.workouts.forEach(w => {
    const day = new Date(w.date).getUTCDate();
    dailyMap[day] = w;
  });

  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const w = dailyMap[day];
    return { day, sets: w?.setCount ?? 0, hasWorkout: !!w };
  });

  const maxMuscle = data.muscleBreakdown[0]?.set_count ?? 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* Gradient header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors text-lg font-bold"
          >
            ‹
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {MONTH_NAMES[m - 1]} {y}
            </h1>
            <p className="text-green-100 text-sm font-medium mt-0.5">
              {data.summary.totalWorkouts} workout{data.summary.totalWorkouts !== 1 ? 's' : ''} · {data.summary.totalSets} sets
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border-l-4 border-green-400">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Workouts</p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{data.summary.totalWorkouts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border-l-4 border-blue-400">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Total Sets</p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">{data.summary.totalSets}</p>
        </div>
      </div>

      {/* Daily chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
          <h2 className="font-bold text-white text-base">📅 Daily Sets</h2>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={chartData.length > 20 ? 4 : 1} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                cursor={{ fill: 'rgba(34,197,94,0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  if (!d.hasWorkout) return null;
                  return (
                    <div style={{ borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', background: 'white', padding: '8px 12px', fontSize: 12 }}>
                      <p style={{ fontWeight: 700, color: '#111' }}>Day {d.day}</p>
                      <p style={{ color: '#22c55e' }}>Sets: {d.sets}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="sets" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.hasWorkout ? '#22c55e' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Muscle breakdown */}
      {data.muscleBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-4">
            <h2 className="font-bold text-white text-base">💪 Muscle Groups</h2>
          </div>
          <div className="p-5 space-y-3">
            {data.muscleBreakdown.map((mg, i) => (
              <div key={mg.muscle_group} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-24 flex-shrink-0">{mg.muscle_group}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${(mg.set_count / maxMuscle) * 100}%`,
                      backgroundColor: MUSCLE_COLORS[i % MUSCLE_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-14 text-right">{mg.set_count} sets</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workout list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
          <h2 className="font-bold text-white text-base">🏋️ Sessions</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.workouts.map(w => (
            <Link
              key={w.id}
              href={`/workout/${w.id}`}
              className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${workoutAccentClass(null)}`}
            >
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(w.date).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC',
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {w.exerciseCount} exercises · {w.setCount} sets
                  {w.durationMin > 0 && ` · ${w.durationMin}m`}
                </p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 text-xl">›</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
