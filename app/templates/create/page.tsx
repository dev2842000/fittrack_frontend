'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { card, btn, input, brand } from '@/lib/theme';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

export default function CreateTemplatePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <CreateTemplateContent />
      </div>
    </AuthGuard>
  );
}

function CreateTemplateContent() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/exercises'),
      api.get('/exercises/muscle-groups'),
    ]).then(([exRes, mgRes]) => {
      setAllExercises(exRes.data.exercises);
      setMuscleGroups(mgRes.data.muscleGroups);
    }).finally(() => setLoadingExercises(false));
  }, []);

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

  const removeExercise = (id: number) => setSelected(prev => prev.filter(e => e.id !== id));

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required'); return; }
    if (selected.length === 0) { setError('Add at least one exercise'); return; }
    setError('');
    setSaving(true);
    try {
      await api.post('/templates', {
        name: name.trim(),
        exercise_ids: selected.map(e => e.id),
      });
      router.replace('/templates');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create template');
      setSaving(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!newExName.trim() || !newExMuscle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/exercises', { name: newExName.trim(), muscle_group: newExMuscle.trim() });
      const ex: Exercise = res.data.exercise;
      setAllExercises(prev => [...prev, ex]);
      setMuscleGroups(prev => prev.includes(ex.muscle_group) ? prev : [...prev, ex.muscle_group].sort());
      setSelected(prev => [...prev, ex]);
      setShowCreate(false);
      setNewExName('');
      setNewExMuscle('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create exercise');
    } finally { setCreating(false); }
  };

  const SUGGESTIONS = ['Push Day', 'Pull Day', 'Leg Day', 'Chest Day', 'Back Day', 'Shoulder Day', 'Arms Day', 'Full Body'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className={btn.icon}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create Template</h1>
      </div>

      {/* Name card */}
      <div className={card.flush}>
        <div className={`${brand.gradient} px-5 py-4`}>
          <h2 className="font-bold text-white text-sm">Template Name</h2>
        </div>
        <div className="p-4 space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="e.g. Push Day, Chest & Triceps..."
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            className={`${input.md} text-sm`}
          />
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setName(s)}
                className={`${btn.chip} text-xs font-semibold border ${name === s ? btn.chipActive + ' border-green-500' : btn.chipInactive}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected exercises */}
      {selected.length > 0 && (
        <div className={card.flush}>
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">
              Selected Exercises
              <span className={`ml-2 px-2 py-0.5 ${brand.badge} text-xs font-bold rounded-full`}>{selected.length}</span>
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
                  className={`${btn.danger} w-7 h-7 flex items-center justify-center flex-shrink-0`}>
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
      <div className={card.flush}>
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Add Exercises</h2>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveGroup('All'); }}
            className={`${input.sm} text-sm`}
          />
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2 scrollbar-none">
            {['All', ...muscleGroups].map(g => (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeGroup === g ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {loadingExercises ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-400 text-center">No exercises found{search ? ` for "${search}"` : ''}</p>
              {!showCreate ? (
                <button
                  onClick={() => { setShowCreate(true); setNewExName(search); }}
                  className="w-full py-2.5 border-2 border-dashed border-green-400 text-green-500 font-bold rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm">
                  + Create new exercise
                </button>
              ) : (
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Exercise</p>
                  <input type="text" value={newExName} onChange={e => setNewExName(e.target.value)}
                    placeholder="Exercise name"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input
                    type="text"
                    list="template-create-category"
                    value={newExMuscle}
                    onChange={e => setNewExMuscle(e.target.value)}
                    placeholder="Category (pick existing or type new)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <datalist id="template-create-category">
                    {muscleGroups.map(g => <option key={g} value={g} />)}
                  </datalist>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreate(false)} className={`${btn.secondary} flex-1 py-2 text-sm`}>Cancel</button>
                    <button onClick={handleCreateExercise} disabled={creating || !newExName.trim() || !newExMuscle.trim()}
                      className={`${btn.primary} flex-1 py-2 text-sm`}>
                      {creating ? 'Creating...' : 'Create & Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            filtered.map(ex => {
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
            })
          )}
        </div>
      </div>

      {/* Error + Save */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !name.trim() || selected.length === 0}
        className={`${btn.primary} w-full py-3.5 text-base`}
      >
        {saving ? 'Saving...' : `Save Template${selected.length > 0 ? ` (${selected.length} exercises)` : ''}`}
      </button>

      {/* Bottom nav spacer */}
      <div className="h-4" />
    </div>
  );
}
