'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface WorkoutDetail {
  id: number;
  name: string | null;
  started_at: string;
  completed_at: string;
  exercises: {
    exercise_id: number;
    exercise_name: string;
    muscle_group: string;
    sets: { id: number; set_number: number; weight_kg: number | null; reps: number }[];
  }[];
}

function duration(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function WorkoutDetailPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <WorkoutDetail />
      </div>
    </AuthGuard>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

function WorkoutDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/workouts/${id}`)
      .then(res => setWorkout(res.data.workout))
      .catch(() => router.replace('/workout'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-4 w-16" />
        {/* Header card skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 space-y-3">
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-4 w-1/4" />
          <div className="grid grid-cols-2 gap-4 pt-1">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
        {/* Exercise row skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <div className="px-4 py-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!workout) return null;

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-green-500 transition-colors">
        ← Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 space-y-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {workout.name || new Date(workout.started_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(workout.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          {' · '}{duration(workout.started_at, workout.completed_at)}
        </p>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <Stat label="Exercises" value={workout.exercises.length} />
          <Stat label="Sets" value={totalSets} />
        </div>
      </div>

      <div className="space-y-3">
        {workout.exercises.map(ex => (
          <div key={ex.exercise_id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">{ex.exercise_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{ex.muscle_group}</p>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              <div className="grid grid-cols-3 text-xs text-gray-400 font-medium mb-2">
                <span>Set</span><span>Weight</span><span>Reps</span>
              </div>
              {ex.sets.map(set => (
                <div key={set.id} className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{set.set_number}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{set.weight_kg ? `${Math.round(set.weight_kg)}kg` : '—'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{set.reps}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
