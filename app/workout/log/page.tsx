'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useWorkout, WorkoutExercise, PreviousBest } from '@/hooks/useWorkout';
import api from '@/lib/api';

export default function WorkoutLogPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <WorkoutTracker />
      </div>
    </AuthGuard>
  );
}

interface LocalExercise {
  exercise_id: number;
  exercise_name: string;
  muscle_group: string;
}

interface Template {
  id: number;
  name: string;
  exercise_count: number;
  exercise_names: string[];
}

function WorkoutTracker() {
  const { workout, loading, fetchError, previousBest, startWorkout, startFromTemplate, logSet, deleteSet, completeWorkout, discardWorkout, refetch } = useWorkout();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [completedWorkoutId, setCompletedWorkoutId] = useState<number | null>(null);
  const [localExercises, setLocalExercises] = useState<LocalExercise[]>([]);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading && !fetchError && !workout) setShowNameModal(true);
  }, [loading, fetchError, workout]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) { setRestTimer(null); return; }
    restRef.current = setInterval(() => setRestTimer(t => (t !== null && t > 0) ? t - 1 : null), 1000);
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restTimer]);

  const handlePickExercise = (id: number, name: string, muscle: string) => {
    setShowExercisePicker(false);
    const inWorkout = workout?.exercises.some(e => e.exercise_id === id);
    const inLocal = localExercises.some(e => e.exercise_id === id);
    if (!inWorkout && !inLocal) {
      setLocalExercises(prev => [...prev, { exercise_id: id, exercise_name: name, muscle_group: muscle }]);
    }
  };

  const handleLogSet = async (exerciseId: number, exerciseName: string, muscleGroup: string, weight: number | null, reps: number) => {
    await logSet(exerciseId, exerciseName, muscleGroup, weight, reps);
    setLocalExercises(prev => prev.filter(e => e.exercise_id !== exerciseId));
    // Start rest timer
    setRestTimer(90);
    if (restRef.current) clearInterval(restRef.current);
  };

  const handleStart = async (name: string) => {
    setShowNameModal(false);
    setStarting(true);
    try { await startWorkout(name.trim() || undefined); } finally { setStarting(false); }
  };

  const handleStartFromTemplate = async (templateId: number) => {
    setShowNameModal(false);
    setStarting(true);
    try {
      const { templateExercises } = await startFromTemplate(templateId);
      setLocalExercises(templateExercises.map((e: LocalExercise) => ({
        exercise_id: e.exercise_id,
        exercise_name: e.exercise_name,
        muscle_group: e.muscle_group,
      })));
    } finally { setStarting(false); }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const workoutId = await completeWorkout();
      setCompletedWorkoutId(workoutId ?? null);
      setShowSaveTemplate(true);
    } finally { setCompleting(false); }
  };

  const handleSaveTemplate = async (name: string) => {
    if (completedWorkoutId && name.trim()) {
      await api.post(`/templates/from-workout/${completedWorkoutId}`, { name: name.trim() });
    }
    setShowSaveTemplate(false);
    router.push('/workout');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading your workout...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-4 text-center">
        <span className="text-4xl">⚠️</span>
        <div>
          <p className="font-bold text-gray-900 dark:text-white">Could not reach the server</p>
          <p className="text-sm text-gray-400 mt-1">Your workout is safe — the server may be waking up. Try again in a few seconds.</p>
        </div>
        <button
          onClick={refetch}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:scale-105 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!workout) {
    return (
      <>
        {starting && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {showNameModal && (
          <WorkoutNameModal
            onStart={handleStart}
            onStartFromTemplate={handleStartFromTemplate}
            onCancel={() => router.replace('/workout')}
          />
        )}
        {showSaveTemplate && (
          <SaveTemplateModal
            defaultName={workout ?? null}
            onSave={handleSaveTemplate}
            onSkip={() => { setShowSaveTemplate(false); router.push('/workout'); }}
          />
        )}
      </>
    );
  }

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalExercises = workout.exercises.length + localExercises.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between border-l-4 border-green-400 shadow-sm">
        <div>
          <p className="text-xs text-green-500 font-bold uppercase tracking-wider">● Live</p>
          <p className="font-bold text-gray-900 dark:text-white">{workout.name || 'Workout'}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(workout.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            {totalExercises > 0 && ` · ${totalExercises} exercises · ${totalSets} sets`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowConfirmDiscard(true)}
            className="px-3 py-1.5 text-sm text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Discard
          </button>
          <button onClick={handleComplete} disabled={completing || totalSets === 0}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md hover:scale-105 active:scale-95">
            {completing ? 'Finishing...' : 'Finish ✓'}
          </button>
        </div>
      </div>

      {/* Rest timer */}
      {restTimer !== null && (
        <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Rest Timer</p>
              <p className="text-2xl font-extrabold text-white">{Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, '0')}</p>
            </div>
          </div>
          <button onClick={() => setRestTimer(null)} className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-xl transition-colors">
            Skip
          </button>
        </div>
      )}

      {/* Exercises */}
      {totalExercises === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">🏋️</p>
          <p className="font-medium">No exercises yet — add one below</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map(ex => (
            <ExerciseCard key={ex.exercise_id} exercise={ex}
              prevBest={previousBest[ex.exercise_id] || null}
              onLogSet={handleLogSet} onDeleteSet={deleteSet} />
          ))}
          {localExercises.map(ex => (
            <ExerciseCard key={`local-${ex.exercise_id}`}
              exercise={{ ...ex, sets: [] }}
              prevBest={previousBest[ex.exercise_id] || null}
              onLogSet={handleLogSet} onDeleteSet={deleteSet} />
          ))}
        </div>
      )}

      <button onClick={() => setShowExercisePicker(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-500 rounded-xl transition-colors font-medium">
        + Add Exercise
      </button>

      {showExercisePicker && (
        <ExercisePicker
          workoutExercises={workout.exercises}
          localExercises={localExercises}
          onClose={() => setShowExercisePicker(false)}
          onAdd={handlePickExercise}
        />
      )}

      {showConfirmDiscard && (
        <ConfirmModal
          title="Discard workout?"
          message="All logged sets will be lost."
          confirmLabel="Discard"
          confirmClass="bg-red-500 hover:bg-red-600"
          onConfirm={async () => { await discardWorkout(); setShowConfirmDiscard(false); }}
          onCancel={() => setShowConfirmDiscard(false)}
        />
      )}

      {showSaveTemplate && (
        <SaveTemplateModal
          defaultName={workout}
          onSave={handleSaveTemplate}
          onSkip={() => { setShowSaveTemplate(false); router.push('/workout'); }}
        />
      )}
    </div>
  );
}

function ExerciseCard({ exercise, prevBest, onLogSet, onDeleteSet }: {
  exercise: WorkoutExercise | (LocalExercise & { sets: [] });
  prevBest: PreviousBest | null;
  onLogSet: (id: number, name: string, muscle: string, weight: number | null, reps: number) => Promise<void>;
  onDeleteSet: (setId: number, exerciseId: number) => Promise<void>;
}) {
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const [weight, setWeight] = useState(lastSet?.weight_kg?.toString() ?? prevBest?.weight_kg?.toString() ?? '');
  const [reps, setReps] = useState(lastSet?.reps?.toString() ?? prevBest?.reps?.toString() ?? '');
  const [logging, setLogging] = useState(false);

  const handleLog = async () => {
    if (!reps || parseInt(reps) < 1) return;
    setLogging(true);
    try {
      await onLogSet(exercise.exercise_id, exercise.exercise_name, exercise.muscle_group,
        weight ? parseFloat(weight) : null, parseInt(reps));
    } finally { setLogging(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{exercise.exercise_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{exercise.muscle_group}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}</p>
          {prevBest && (
            <p className="text-xs text-green-500 font-semibold mt-0.5">
              Last: {prevBest.weight_kg ? `${Math.round(prevBest.weight_kg)}kg ×` : ''} {prevBest.reps} reps
            </p>
          )}
        </div>
      </div>

      {exercise.sets.length > 0 && (
        <div className="px-4 py-2 space-y-1">
          <div className="grid grid-cols-4 text-xs text-gray-400 font-medium mb-1">
            <span>Set</span><span>Weight</span><span>Reps</span><span></span>
          </div>
          {exercise.sets.map(set => (
            <div key={set.id} className="grid grid-cols-4 text-sm items-center">
              <span className="text-gray-500 dark:text-gray-400">{set.set_number}</span>
              <span className="font-medium text-gray-900 dark:text-white">{set.weight_kg ? `${Math.round(set.weight_kg)}kg` : '—'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{set.reps}</span>
              <button onClick={() => onDeleteSet(set.id, exercise.exercise_id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-xs justify-self-end">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
        <input type="number" placeholder="kg" value={weight} onChange={e => setWeight(e.target.value)}
          min="0" step="0.5"
          className="w-20 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="number" placeholder="reps" value={reps} onChange={e => setReps(e.target.value)} min="1"
          className="w-20 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button onClick={handleLog} disabled={logging || !reps}
          className="flex-1 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
          {logging ? '...' : '+ Log Set'}
        </button>
      </div>
    </div>
  );
}

function WorkoutNameModal({ onStart, onStartFromTemplate, onCancel }: {
  onStart: (name: string) => void;
  onStartFromTemplate: (id: number) => void;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<'new' | 'template'>('new');
  const [name, setName] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const suggestions = ['Chest Day', 'Back Day', 'Leg Day', 'Push Day', 'Pull Day', 'Shoulder Day', 'Arms Day', 'Full Body'];

  useEffect(() => {
    api.get('/templates').then(r => setTemplates(r.data.templates)).catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
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
              <input autoFocus type="text" placeholder="e.g. Chest Day, Pull Day..."
                value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onStart(name)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
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
              <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={() => onStart(name)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25">
                  {name.trim() ? '▶ Start' : '▶ Start (unnamed)'}
                </button>
              </div>
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
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => onStartFromTemplate(t.id)}
                      className="w-full text-left p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group">
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">{t.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.exercise_count} exercises · {t.exercise_names.slice(0, 3).join(', ')}{t.exercise_names.length > 3 ? '...' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={onCancel} className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold">Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveTemplateModal({ defaultName, onSave, onSkip }: {
  defaultName: { name: string | null } | null;
  onSave: (name: string) => Promise<void>;
  onSkip: () => void;
}) {
  const [name, setName] = useState(defaultName?.name || '');
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Save as template? 📋</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Save this workout so you can reuse it next time — no need to pick exercises again.</p>
        </div>
        <input type="text" placeholder="Template name e.g. Push Day"
          value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <div className="flex gap-2">
          <button onClick={onSkip} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Skip
          </button>
          <button
            onClick={async () => { setSaving(true); await onSave(name); setSaving(false); }}
            disabled={saving || !name.trim()}
            className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25">
            {saving ? 'Saving...' : 'Save template'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExercisePicker({ onClose, onAdd, workoutExercises, localExercises }: {
  workoutExercises: WorkoutExercise[];
  localExercises: LocalExercise[];
  onClose: () => void;
  onAdd: (id: number, name: string, muscle: string) => void;
}) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/exercises/muscle-groups').then(res => {
      setMuscleGroups(res.data.muscleGroups);
      setNewMuscle(res.data.muscleGroups[0] || '');
    });
    api.get('/exercises').then(res => setExercises(res.data.exercises));
  }, []);

  const filtered = exercises.filter(ex => {
    const matchesGroup = activeGroup === 'All' || ex.muscle_group === activeGroup;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const alreadyAdded = new Set([
    ...workoutExercises.map(e => e.exercise_id),
    ...localExercises.map(e => e.exercise_id),
  ]);

  const handleCreate = async () => {
    if (!newName.trim() || !newMuscle) return;
    setCreating(true);
    try {
      const res = await api.post('/exercises', { name: newName.trim(), muscle_group: newMuscle });
      const ex = res.data.exercise;
      setExercises(prev => [...prev, ex]);
      onAdd(ex.id, ex.name, ex.muscle_group);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create exercise');
    } finally { setCreating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg font-bold">←</button>
        <h2 className="font-bold text-gray-900 dark:text-white flex-1">Add Exercise</h2>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
        <input autoFocus type="text" placeholder="Search exercises..."
          value={search} onChange={e => { setSearch(e.target.value); setShowCreate(false); }}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', ...muscleGroups].map(g => (
            <button key={g} onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeGroup === g ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {filtered.map(ex => {
          const added = alreadyAdded.has(ex.id);
          return (
            <button key={ex.id} onClick={() => !added && onAdd(ex.id, ex.name, ex.muscle_group)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${added ? 'opacity-40 cursor-default' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{ex.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ex.muscle_group}</p>
              </div>
              {added ? <span className="text-xs text-green-500 font-medium">Added</span> : <span className="text-green-500 text-lg">+</span>}
            </button>
          );
        })}

        {/* Inline create — shown when search has text and no results */}
        {search.trim() && filtered.length === 0 && (
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No exercise found for "<strong>{search}</strong>"</p>
            {!showCreate ? (
              <button onClick={() => { setShowCreate(true); setNewName(search); }}
                className="w-full py-2.5 border-2 border-dashed border-green-400 text-green-500 font-bold rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm">
                + Create "{search}"
              </button>
            ) : (
              <div className="space-y-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">New Exercise</p>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Exercise name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                <select value={newMuscle} onChange={e => setNewMuscle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  {muscleGroups.map(g => <option key={g}>{g}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-gray-200 dark:border-gray-600 text-gray-500 rounded-xl text-sm">Cancel</button>
                  <button onClick={handleCreate} disabled={creating || !newName.trim()}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                    {creating ? 'Creating...' : 'Create & Add'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string;
  confirmClass: string; onConfirm: () => Promise<void>; onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium">Cancel</button>
          <button onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            disabled={loading} className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 ${confirmClass}`}>
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
