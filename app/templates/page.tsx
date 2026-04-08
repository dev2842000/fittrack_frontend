'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Template {
  id: number;
  name: string;
  created_at: string;
  exercise_count: number;
  exercise_names: string[];
}

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  instructions?: string;
}

export default function TemplatesPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <TemplateList />
      </div>
    </AuthGuard>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

/* ── Create Template Modal ── */
function CreateTemplateModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (t: Template) => void;
}) {
  const [step, setStep] = useState<'name' | 'exercises'>('name');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Exercise picker state
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [pickerLoading, setPickerLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/exercises'),
      api.get('/exercises/muscle-groups'),
    ]).then(([exRes, mgRes]) => {
      setAllExercises(exRes.data.exercises);
      setMuscleGroups(mgRes.data.muscleGroups);
    }).finally(() => setPickerLoading(false));
  }, []);

  const filtered = allExercises.filter(ex => {
    const matchGroup = activeGroup === 'All' || ex.muscle_group === activeGroup;
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const selectedIds = new Set(selected.map(e => e.id));

  const toggleExercise = (ex: Exercise) => {
    setSelected(prev =>
      selectedIds.has(ex.id)
        ? prev.filter(e => e.id !== ex.id)
        : [...prev, ex]
    );
  };

  const removeExercise = (id: number) => setSelected(prev => prev.filter(e => e.id !== id));

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required'); return; }
    if (selected.length === 0) { setError('Add at least one exercise'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/templates', {
        name: name.trim(),
        exercise_ids: selected.map(e => e.id),
      });
      // Re-fetch to get full template data (exercise_names etc.)
      const listRes = await api.get('/templates');
      const created = listRes.data.templates.find((t: Template) => t.id === res.data.template.id);
      onCreate(created || res.data.template);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const SUGGESTIONS = ['Chest Day', 'Back Day', 'Leg Day', 'Push Day', 'Pull Day', 'Shoulder Day', 'Arms Day', 'Full Body'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-lg">←</button>
        <h2 className="font-bold text-gray-900 dark:text-white flex-1">Create Template</h2>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || selected.length === 0}
          className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl shadow-md transition-all"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Name section */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
        <input
          autoFocus
          type="text"
          placeholder="Template name e.g. Push Day..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
        {name === '' && (
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setName(s)}
                className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-500 transition-all">
                {s}
              </button>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>

      {/* Selected exercises */}
      {selected.length > 0 && (
        <div className="px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800/50">
          <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
            {selected.length} exercise{selected.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map(ex => (
              <span key={ex.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-full text-xs font-semibold text-green-700 dark:text-green-300">
                {ex.name}
                <button onClick={() => removeExercise(ex.id)} className="text-green-400 hover:text-red-400 transition-colors leading-none">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 space-y-2 bg-white dark:bg-gray-900">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveGroup('All'); }}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...muscleGroups].map(g => (
            <button key={g} onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeGroup === g ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {pickerLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium text-sm">No exercises found</p>
          </div>
        ) : (
          filtered.map(ex => {
            const isSelected = selectedIds.has(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => toggleExercise(ex)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div>
                  <p className={`font-medium text-sm ${isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>{ex.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ex.muscle_group}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all ${isSelected ? 'bg-green-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
  );
}

/* ── Template list ── */
function TemplateList() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [starting, setStarting] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/templates')
      .then(r => setTemplates(r.data.templates))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (templateId: number) => {
    setStarting(templateId);
    try {
      await api.post(`/workouts/from-template/${templateId}`);
      router.push('/workout/log');
    } catch (err: any) {
      if (err.response?.status === 409) {
        router.push('/workout/log');
      } else {
        alert(err.response?.data?.error || 'Failed to start workout');
      }
    } finally {
      setStarting(null);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Delete this template?')) return;
    setDeletingId(templateId);
    try {
      await api.delete(`/templates/${templateId}`);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch {
      alert('Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Templates</h1>
            <p className="text-green-100 text-sm mt-1 font-medium">
              Saved workout routines — start one in seconds
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/5" />
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3.5 w-3/5 mt-1" />
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">No templates yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-xs mx-auto">
            Create a template from scratch or save a completed workout as a template
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-6">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:scale-105 transition-all text-sm"
            >
              + Create template
            </button>
            <button
              onClick={() => router.push('/workout/log')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
            >
              Start a workout →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-base truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.exercise_count} exercise{t.exercise_count !== 1 ? 's' : ''} ·{' '}
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {t.exercise_names.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {t.exercise_names.slice(0, 5).join(' · ')}
                      {t.exercise_names.length > 5 && ` +${t.exercise_names.length - 5} more`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStart(t.id)}
                    disabled={starting === t.id}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    {starting === t.id ? '...' : '▶ Start'}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="px-4 py-2 text-sm text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    {deletingId === t.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTemplateModal
          onClose={() => setShowCreate(false)}
          onCreate={t => setTemplates(prev => [t, ...prev])}
        />
      )}
    </div>
  );
}
