'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

export default function EditTemplatePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <EditTemplateContent />
      </div>
    </AuthGuard>
  );
}

function EditTemplateContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [loadingExercises, setLoadingExercises] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/templates/${id}/exercises`),
      api.get('/exercises'),
      api.get('/exercises/muscle-groups'),
    ]).then(([tmplRes, exRes, mgRes]) => {
      const tmplExercises: Exercise[] = tmplRes.data.exercises.map((e: any) => ({
        id: e.exercise_id,
        name: e.exercise_name,
        muscle_group: e.muscle_group,
      }));
      setSelected(tmplExercises);
      setAllExercises(exRes.data.exercises);
      setMuscleGroups(mgRes.data.muscleGroups);
    }).catch(() => router.replace('/templates'))
      .finally(() => { setLoadingTemplate(false); setLoadingExercises(false); });

    // Also fetch template name
    api.get('/templates').then(r => {
      const t = r.data.templates.find((t: any) => String(t.id) === String(id));
      if (t) setName(t.name);
    });
  }, [id, router]);

  const filtered = allExercises.filter(ex => {
    const matchGroup = activeGroup === 'All' || ex.muscle_group === activeGroup;
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const selectedIds = new Set(selected.map(e => e.id));

  const toggleExercise = (ex: Exercise) => {
    setSelected(prev =>
      selectedIds.has(ex.id) ? prev.filter(e => e.id !== ex.id) : [...prev, ex]
    );
  };

  const removeExercise = (exId: number) => setSelected(prev => prev.filter(e => e.id !== exId));

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required'); return; }
    if (selected.length === 0) { setError('Add at least one exercise'); return; }
    setError('');
    setSaving(true);
    try {
      await api.put(`/templates/${id}`, {
        name: name.trim(),
        exercise_ids: selected.map(e => e.id),
      });
      router.replace('/templates');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save template');
      setSaving(false);
    }
  };

  if (loadingTemplate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
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
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Edit Template</h1>
      </div>

      {/* Name */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
          <h2 className="font-bold text-white text-sm">Template Name</h2>
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="e.g. Push Day, Chest & Triceps..."
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Selected exercises */}
      {selected.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">
              Exercises
              <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">{selected.length}</span>
            </h2>
          </div>
          <div className="p-4 space-y-1.5">
            {selected.map((ex, i) => (
              <div key={ex.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{ex.name}</p>
                  <p className="text-xs text-gray-400">{ex.muscle_group}</p>
                </div>
                <button onClick={() => removeExercise(ex.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise picker */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Add / Remove Exercises</h2>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveGroup('All'); }}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
            {['All', ...muscleGroups].map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeGroup === g ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
          {loadingExercises ? (
            <div className="p-4 space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-11 w-full" />)}</div>
          ) : filtered.map(ex => {
            const isSelected = selectedIds.has(ex.id);
            return (
              <button key={ex.id} onClick={() => toggleExercise(ex)}
                className={`w-full flex items-center justify-between px-5 py-3 text-left transition-colors ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <div>
                  <p className={`font-medium text-sm ${isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>{ex.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ex.muscle_group}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all ${isSelected ? 'bg-green-500' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving || !name.trim() || selected.length === 0}
        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-xl shadow-green-500/30 hover:scale-[1.02] active:scale-95 transition-all text-base">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      <div className="h-4" />
    </div>
  );
}
