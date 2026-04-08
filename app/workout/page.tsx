'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';

interface WorkoutSummary {
  id: number;
  name: string | null;
  started_at: string;
  completed_at: string;
  exercise_count: number;
  set_count: number;
}

function duration(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// Returns a colored left-border class based on workout name
function workoutAccentClass(name: string | null): string {
  if (!name) return 'border-l-4 border-green-400';
  const lower = name.toLowerCase();
  if (lower.includes('push') || lower.includes('chest') || lower.includes('shoulder')) return 'border-l-4 border-blue-400';
  if (lower.includes('pull') || lower.includes('back') || lower.includes('bicep')) return 'border-l-4 border-purple-400';
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('glute')) return 'border-l-4 border-orange-400';
  return 'border-l-4 border-green-400';
}

function workoutAccentDot(name: string | null): string {
  if (!name) return 'bg-green-400';
  const lower = name.toLowerCase();
  if (lower.includes('push') || lower.includes('chest') || lower.includes('shoulder')) return 'bg-blue-400';
  if (lower.includes('pull') || lower.includes('back') || lower.includes('bicep')) return 'bg-purple-400';
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('glute')) return 'bg-orange-400';
  return 'bg-green-400';
}

export default function WorkoutPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <WorkoutHistory />
      </div>
    </AuthGuard>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<{ id: number; name: string | null; started_at: string } | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/workouts').then(res => setWorkouts(res.data.workouts)),
      api.get('/workouts/active').then(res => setActiveWorkout(res.data.workout)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header with gradient accent */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 p-6 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Workout History</h1>
          <p className="text-green-100 text-sm mt-1 font-medium">All your completed sessions</p>
          <button
            onClick={() => {
              const token = getToken();
              const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
              const url = `${base}/workouts/export`;
              fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.blob())
                .then(blob => {
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = 'fittrack-export.csv';
                  a.click();
                });
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-green-100 hover:text-white font-semibold transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="animate-pulse bg-white/30 rounded-xl h-10 w-32 flex-shrink-0" />
        ) : (
          <Link
            href="/workout/log"
            className="relative flex-shrink-0 px-4 py-2.5 bg-white hover:bg-green-50 text-green-600 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {activeWorkout ? '▶ Resume' : '+ Start Workout'}
          </Link>
        )}
      </div>

      {/* Active workout banner */}
      {activeWorkout && (
        <Link
          href="/workout/log"
          className="block bg-green-500 hover:bg-green-600 rounded-2xl p-4 shadow-lg shadow-green-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <p className="text-xs text-green-100 font-bold uppercase tracking-wider">Workout in progress</p>
              </div>
              <p className="text-white font-extrabold text-base">{activeWorkout.name || 'Unnamed Workout'}</p>
              <p className="text-green-100 text-xs mt-0.5">
                Started at {new Date(activeWorkout.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <span className="text-white text-2xl">▶</span>
          </div>
        </Link>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">🏃</div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">No workouts yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
            Your completed sessions will show up here
          </p>
          <Link
            href="/workout/log"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 transition-all duration-200"
          >
            Start your first workout →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map(w => {
            const accent = workoutAccentClass(w.name);
            const dot = workoutAccentDot(w.name);
            const dateObj = new Date(w.started_at);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <Link
                key={w.id}
                href={`/workout/${w.id}`}
                className={`block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-200 ${accent} overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                          {w.name || `${dayName} Workout`}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                          {dateStr} · {timeStr} · {duration(w.started_at, w.completed_at)}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600 text-xl font-light">›</span>
                  </div>
                  <div className="flex gap-5 mt-3 pl-5">
                    <Stat label="Exercises" value={w.exercise_count} />
                    <Stat label="Sets" value={w.set_count} />
                    <Stat label="Duration" value={duration(w.started_at, w.completed_at)} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-base font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
