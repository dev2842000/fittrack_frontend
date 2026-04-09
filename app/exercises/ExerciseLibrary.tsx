'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { banner, btn, input } from '@/lib/theme';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  is_custom: boolean;
}

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Chest:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Back:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shoulders:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Biceps:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Triceps:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Quads:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Hamstrings: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Glutes:     'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Calves:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Core:       'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

export default function ExerciseLibrary({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // After hydration, fetch to merge in custom exercises for this user
  useEffect(() => {
    setHydrated(true);
    api.get('/exercises/muscle-groups').then(res => setMuscleGroups(res.data.muscleGroups));
    api.get('/exercises').then(res => setExercises(res.data.exercises)).catch(() => {});
  }, []);

  const fetchFiltered = useCallback(async () => {
    if (!hydrated) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeGroup !== 'All') params.muscle_group = activeGroup;
      if (search) params.search = search;
      const res = await api.get('/exercises', { params });
      setExercises(res.data.exercises);
    } catch {}
    finally { setLoading(false); }
  }, [activeGroup, search, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!search && activeGroup === 'All') return; // already have full list
    const debounce = setTimeout(fetchFiltered, 250);
    return () => clearTimeout(debounce);
  }, [fetchFiltered, hydrated, search, activeGroup]);

  const handleAdded = (exercise: Exercise) => {
    setExercises(prev => [...prev, exercise]);
    setMuscleGroups(prev =>
      prev.includes(exercise.muscle_group) ? prev : [...prev, exercise.muscle_group].sort()
    );
    setShowModal(false);
  };

  const displayed = !hydrated
    ? (activeGroup === 'All'
        ? initialExercises
        : initialExercises.filter(e => e.muscle_group === activeGroup))
    : exercises;

  const filteredDisplay = search && !hydrated
    ? displayed.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : displayed;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className={`${banner} p-6 flex items-center justify-between`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">📚 Exercise Library</h1>
          <p className="text-green-100 text-sm mt-1 font-medium">{filteredDisplay.length} exercises</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="relative flex-shrink-0 px-4 py-2.5 bg-white hover:bg-green-50 text-green-600 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
        >
          + Add custom
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={input.md}
      />

      {/* Muscle group filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...muscleGroups].map(group => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`${btn.chip} ${activeGroup === group ? btn.chipActive : btn.chipInactive}`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between h-[68px]">
              <div className="space-y-1.5">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-4 w-28" />
              </div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-6 w-16" />
            </div>
          ))}
        </div>
      ) : filteredDisplay.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="font-medium">No exercises found</p>
          <p className="text-sm mt-1">Try a different search or add a custom one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDisplay.map(ex => (
            <div
              key={ex.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-green-300 dark:hover:border-green-700 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{ex.name}</p>
                {ex.is_custom && <p className="text-xs text-green-500 mt-0.5">Custom</p>}
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${MUSCLE_GROUP_COLORS[ex.muscle_group] || 'bg-gray-100 text-gray-600'}`}>
                {ex.muscle_group}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddExerciseModal muscleGroups={muscleGroups} onAdd={handleAdded} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function AddExerciseModal({ muscleGroups, onAdd, onClose }: {
  muscleGroups: string[];
  onAdd: (ex: Exercise) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const group = muscleGroup.trim();
    if (!name.trim() || !group) { setError('Name and category are required'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/exercises', { name: name.trim(), muscle_group: group });
      onAdd(res.data.exercise);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add exercise');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Add custom exercise</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercise name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pendlay Row"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <input
              type="text"
              list="category-options"
              required
              value={muscleGroup}
              onChange={e => setMuscleGroup(e.target.value)}
              placeholder="Pick existing or type a new one…"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <datalist id="category-options">
              {muscleGroups.map(g => <option key={g} value={g} />)}
            </datalist>
            <p className="text-xs text-gray-400 mt-1">e.g. Cardio, Yoga, Warmup — type anything to create a new category</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className={`${btn.secondary} flex-1 py-2 text-sm`}>Cancel</button>
            <button type="submit" disabled={submitting} className={`${btn.primary} flex-1 py-2 text-sm`}>
              {submitting ? 'Adding...' : 'Add exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
