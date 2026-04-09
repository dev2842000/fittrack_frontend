'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Template {
  id: number;
  name: string;
  exercise_count: number;
  exercise_names: string[];
}

export default function StartWorkoutPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <StartWorkoutContent />
      </div>
    </AuthGuard>
  );
}

function StartWorkoutContent() {
  const router = useRouter();
  const [tab, setTab] = useState<'new' | 'template'>('new');
  const [name, setName] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [starting, setStarting] = useState(false);

  const suggestions = ['Chest Day', 'Back Day', 'Leg Day', 'Push Day', 'Pull Day', 'Shoulder Day', 'Arms Day', 'Full Body'];

  useEffect(() => {
    api.get('/templates').then(r => setTemplates(r.data.templates)).catch(() => {});
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      await api.post('/workouts', { name: name.trim() || undefined });
      router.replace('/workout/log');
    } catch (err: any) {
      if (err.response?.status === 409) {
        router.replace('/workout/log');
      }
    } finally {
      setStarting(false);
    }
  };

  const handleStartFromTemplate = async (templateId: number) => {
    setStarting(true);
    try {
      await api.post(`/workouts/from-template/${templateId}`);
      router.replace(`/workout/log?template=${templateId}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        router.replace('/workout/log');
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white shadow-sm transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Start Workout</h1>
          <p className="text-xs text-gray-400 mt-0.5">New session or pick a saved template</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          {(['new', 'template'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${tab === t
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              {t === 'new' ? '✏️ New Workout' : '📋 From Template'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {tab === 'new' ? (
            <>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Chest Day, Pull Day..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !starting && handleStart()}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => setName(s)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${name === s
                      ? 'bg-green-500 text-white border-green-500'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={handleStart}
                disabled={starting}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25 transition-all"
              >
                {starting ? 'Starting...' : name.trim() ? '▶ Start' : '▶ Start (unnamed)'}
              </button>
            </>
          ) : (
            <>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm font-medium">No templates yet</p>
                  <p className="text-xs mt-1">Finish a workout and save it as a template</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => handleStartFromTemplate(t.id)}
                      disabled={starting}
                      className="w-full text-left p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group disabled:opacity-50">
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">{t.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.exercise_count} exercises{t.exercise_names.length > 0 ? ` · ${t.exercise_names.slice(0, 3).join(', ')}${t.exercise_names.length > 3 ? '...' : ''}` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
