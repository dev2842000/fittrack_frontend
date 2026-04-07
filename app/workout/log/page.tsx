'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useWorkout, WorkoutExercise, WorkoutSet, PreviousBest } from '@/hooks/useWorkout';
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

// Feature 1: format elapsed time
function formatElapsed(startedAt: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m} min`;
}

// Feature 5: Workout summary modal
function WorkoutSummaryModal({
  snapshot,
  prCount,
  onSaveTemplate,
  onDone,
}: {
  snapshot: { name: string | null; started_at: string; exercises: WorkoutExercise[] };
  prCount: number;
  onSaveTemplate: () => void;
  onDone: () => void;
}) {
  const totalSets = snapshot.exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const totalVolume = snapshot.exercises.reduce((a, ex) =>
    a + ex.sets.reduce((b, s) => b + (s.weight_kg ?? 0) * s.reps, 0), 0
  );
  const durationMs = Date.now() - new Date(snapshot.started_at).getTime();
  const durationMin = Math.round(durationMs / 60000);
  const h = Math.floor(durationMin / 60);
  const m = durationMin % 60;
  const durationStr = h > 0 ? `${h}h ${m}m` : `${durationMin} min`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 text-center">
          <p className="text-4xl mb-1">🎉</p>
          <h2 className="text-xl font-extrabold text-white">Workout Complete!</h2>
          <p className="text-green-100 text-sm mt-0.5">{snapshot.name || 'Great session'}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Duration', value: durationStr, icon: '⏱️' },
              { label: 'Exercises', value: snapshot.exercises.length, icon: '🏋️' },
              { label: 'Total Sets', value: totalSets, icon: '📋' },
              { label: 'Volume', value: `${Math.round(totalVolume).toLocaleString()}kg`, icon: '⚡' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-xl">{stat.icon}</p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
          {prCount > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl px-4 py-2.5">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                {prCount} Personal Record{prCount > 1 ? 's' : ''} set this workout!
              </p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={onDone}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Done
            </button>
            <button onClick={onSaveTemplate}
              className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25">
              Save as Template?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkoutTracker() {
  const { workout, loading, fetchError, previousBest, startWorkout, startFromTemplate, logSet, editSet, deleteSet, completeWorkout, discardWorkout, refetch, mergePreviousBest } = useWorkout();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedWorkoutId, setCompletedWorkoutId] = useState<number | null>(null);
  const [completedSnapshot, setCompletedSnapshot] = useState<WorkoutExercise[] | null>(null);
  const [completedWorkoutName, setCompletedWorkoutName] = useState<string | null>(null);
  const [completedStartedAt, setCompletedStartedAt] = useState<string>('');
  const [localExercises, setLocalExercises] = useState<LocalExercise[]>([]);

  // Feature 4: track PR set IDs across the whole tracker
  const [prSetIds, setPrSetIds] = useState<Set<number>>(new Set());

  // Feature 1: elapsed timer display
  const [, forceTickDisplay] = useState(0);
  useEffect(() => {
    if (!workout) return;
    const id = setInterval(() => forceTickDisplay(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [workout?.id]);

  // Feature 10: rest duration from localStorage
  const [restDuration, setRestDuration] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('rest_duration') || '90');
    }
    return 90;
  });

  const handleSetRestDuration = (d: number) => {
    setRestDuration(d);
    localStorage.setItem('rest_duration', String(d));
  };

  // Restore localExercises from localStorage when workout loads
  useEffect(() => {
    if (!workout) return;
    const saved = localStorage.getItem(`workout_exercises_${workout.id}`);
    if (saved) {
      try {
        const parsed: LocalExercise[] = JSON.parse(saved);
        const loggedIds = new Set(workout.exercises.map(e => e.exercise_id));
        const restored = parsed.filter(e => !loggedIds.has(e.exercise_id));
        setLocalExercises(restored);
        const missingIds = restored.map(e => e.exercise_id).filter(id => !previousBest[id]);
        if (missingIds.length > 0) {
          api.get(`/workouts/previous-best?exerciseIds=${missingIds.join(',')}`).then(res => {
            mergePreviousBest(res.data.previousBest);
          }).catch(() => {});
        }
      } catch {}
    }
  }, [workout?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist localExercises to localStorage whenever they change
  useEffect(() => {
    if (!workout) return;
    if (localExercises.length > 0) {
      localStorage.setItem(`workout_exercises_${workout.id}`, JSON.stringify(localExercises));
    } else {
      localStorage.removeItem(`workout_exercises_${workout.id}`);
    }
  }, [localExercises, workout?.id]);

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

  const handlePickExercise = async (id: number, name: string, muscle: string) => {
    setShowExercisePicker(false);
    const inWorkout = workout?.exercises.some(e => e.exercise_id === id);
    const inLocal = localExercises.some(e => e.exercise_id === id);
    if (!inWorkout && !inLocal) {
      setLocalExercises(prev => [...prev, { exercise_id: id, exercise_name: name, muscle_group: muscle }]);
      if (!previousBest[id]) {
        try {
          const res = await api.get(`/workouts/previous-best?exerciseIds=${id}`);
          mergePreviousBest(res.data.previousBest);
        } catch {}
      }
    }
  };

  const handleLogSet = async (exerciseId: number, exerciseName: string, muscleGroup: string, weight: number | null, reps: number) => {
    const newSet = await logSet(exerciseId, exerciseName, muscleGroup, weight, reps);
    setLocalExercises(prev => prev.filter(e => e.exercise_id !== exerciseId));

    // Feature 4: check for PR
    if (newSet) {
      const best = previousBest[exerciseId];
      if (best) {
        const isWeightPR = weight !== null && best.weight_kg !== null && weight > best.weight_kg;
        const isSameWeightMoreReps = weight !== null && best.weight_kg !== null && weight === best.weight_kg && reps > best.reps;
        const isBodyweightPR = weight === null && best.weight_kg === null && reps > best.reps;
        if (isWeightPR || isSameWeightMoreReps || isBodyweightPR) {
          setPrSetIds(prev => new Set(Array.from(prev).concat(newSet.id)));
        }
      }
    }

    // Feature 10: use restDuration
    setRestTimer(restDuration);
    if (restRef.current) clearInterval(restRef.current);
  };

  const handleStart = async (name: string) => {
    setShowNameModal(false);
    setStarting(true);
    try {
      await startWorkout(name.trim() || undefined);
    } catch (err: any) {
      if (err.response?.status === 409) {
        await refetch();
      }
    } finally {
      setStarting(false);
    }
  };

  const handleStartFromTemplate = async (templateId: number) => {
    setShowNameModal(false);
    setStarting(true);
    try {
      let templateExercises: LocalExercise[] = [];
      try {
        ({ templateExercises } = await startFromTemplate(templateId));
      } catch (err: any) {
        if (err.response?.status === 409) {
          await refetch();
          return;
        }
        throw err;
      }
      const exs: LocalExercise[] = templateExercises.map((e: LocalExercise) => ({
        exercise_id: e.exercise_id,
        exercise_name: e.exercise_name,
        muscle_group: e.muscle_group,
      }));
      setLocalExercises(exs);
      const ids = exs.map(e => e.exercise_id);
      if (ids.length > 0) {
        api.get(`/workouts/previous-best?exerciseIds=${ids.join(',')}`).then(res => {
          mergePreviousBest(res.data.previousBest);
        }).catch(() => {});
      }
    } finally { setStarting(false); }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const result = await completeWorkout();
      if (result) {
        setCompletedWorkoutId(result.id);
        setCompletedSnapshot(result.snapshot.exercises);
        setCompletedWorkoutName(result.snapshot.name);
        setCompletedStartedAt(result.snapshot.started_at);
        setShowSummary(true);
      }
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
        {showSummary && completedSnapshot && (
          <WorkoutSummaryModal
            snapshot={{ name: completedWorkoutName, started_at: completedStartedAt, exercises: completedSnapshot }}
            prCount={prSetIds.size}
            onSaveTemplate={() => { setShowSummary(false); setShowSaveTemplate(true); }}
            onDone={() => { setShowSummary(false); router.push('/workout'); }}
          />
        )}
        {showSaveTemplate && (
          <SaveTemplateModal
            defaultName={{ name: completedWorkoutName }}
            onSave={handleSaveTemplate}
            onSkip={() => { setShowSaveTemplate(false); router.push('/workout'); }}
          />
        )}
      </>
    );
  }

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalExercises = workout.exercises.length + localExercises.length;

  // Feature 1: elapsed
  const elapsed = formatElapsed(workout.started_at);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between border-l-4 border-green-400 shadow-sm">
        <div>
          <p className="text-xs text-green-500 font-bold uppercase tracking-wider">● Live</p>
          <p className="font-bold text-gray-900 dark:text-white">{workout.name || 'Workout'}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(workout.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            <span className="text-green-500 font-semibold">{elapsed}</span>
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

      {/* Rest timer — Feature 10: duration picker */}
      {restTimer !== null && (
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
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
          <div className="flex gap-2">
            {[{ label: '60s', val: 60 }, { label: '90s', val: 90 }, { label: '2m', val: 120 }, { label: '3m', val: 180 }].map(opt => (
              <button
                key={opt.val}
                onClick={() => handleSetRestDuration(opt.val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${restDuration === opt.val ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
              prSetIds={prSetIds}
              onLogSet={handleLogSet}
              onDeleteSet={deleteSet}
              onEditSet={editSet} />
          ))}
          {localExercises.map(ex => (
            <ExerciseCard key={`local-${ex.exercise_id}`}
              exercise={{ ...ex, sets: [] }}
              prevBest={previousBest[ex.exercise_id] || null}
              prSetIds={prSetIds}
              onLogSet={handleLogSet}
              onDeleteSet={deleteSet}
              onEditSet={editSet} />
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
          onConfirm={async () => {
            await discardWorkout();
            setShowConfirmDiscard(false);
            router.replace('/workout');
          }}
          onCancel={() => setShowConfirmDiscard(false)}
        />
      )}

      {showSummary && completedSnapshot && (
        <WorkoutSummaryModal
          snapshot={{ name: completedWorkoutName, started_at: completedStartedAt, exercises: completedSnapshot }}
          prCount={prSetIds.size}
          onSaveTemplate={() => { setShowSummary(false); setShowSaveTemplate(true); }}
          onDone={() => { setShowSummary(false); router.push('/workout'); }}
        />
      )}

      {showSaveTemplate && (
        <SaveTemplateModal
          defaultName={{ name: completedWorkoutName }}
          onSave={handleSaveTemplate}
          onSkip={() => { setShowSaveTemplate(false); router.push('/workout'); }}
        />
      )}
    </div>
  );
}

function ExerciseCard({ exercise, prevBest, prSetIds, onLogSet, onDeleteSet, onEditSet }: {
  exercise: WorkoutExercise | (LocalExercise & { sets: WorkoutSet[] });
  prevBest: PreviousBest | null;
  prSetIds: Set<number>;
  onLogSet: (id: number, name: string, muscle: string, weight: number | null, reps: number) => Promise<void>;
  onDeleteSet: (setId: number, exerciseId: number) => Promise<void>;
  onEditSet: (setId: number, exerciseId: number, weightKg: number | null, reps: number) => Promise<void>;
}) {
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const [weight, setWeight] = useState(lastSet?.weight_kg?.toString() ?? prevBest?.weight_kg?.toString() ?? '');
  const [reps, setReps] = useState(lastSet?.reps?.toString() ?? prevBest?.reps?.toString() ?? '');
  const [logging, setLogging] = useState(false);

  // Feature 3: inline edit state
  const [editingSetId, setEditingSetId] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    if (!reps || parseInt(reps) < 1) return;
    setLogging(true);
    try {
      await onLogSet(exercise.exercise_id, exercise.exercise_name, exercise.muscle_group,
        weight ? parseFloat(weight) : null, parseInt(reps));
    } finally { setLogging(false); }
  };

  const handleEditStart = (set: WorkoutSet) => {
    setEditingSetId(set.id);
    setEditWeight(set.weight_kg?.toString() ?? '');
    setEditReps(set.reps.toString());
  };

  const handleEditSave = async (setId: number) => {
    if (!editReps || parseInt(editReps) < 1) return;
    setSaving(true);
    try {
      await onEditSet(setId, exercise.exercise_id, editWeight ? parseFloat(editWeight) : null, parseInt(editReps));
      setEditingSetId(null);
    } finally { setSaving(false); }
  };

  // Feature 8: progressive overload nudge
  const showNudge = prevBest
    && weight !== '' && reps !== ''
    && parseFloat(weight) === prevBest.weight_kg
    && parseInt(reps) === prevBest.reps;

  const sets = exercise.sets as WorkoutSet[];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{exercise.exercise_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{exercise.muscle_group}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{sets.length} {sets.length === 1 ? 'set' : 'sets'}</p>
          {prevBest && (
            <p className="text-xs text-green-500 font-semibold mt-0.5">
              Last: {prevBest.weight_kg ? `${Math.round(prevBest.weight_kg)}kg ×` : ''} {prevBest.reps} reps
            </p>
          )}
        </div>
      </div>

      {sets.length > 0 && (
        <div className="px-3 py-2 space-y-1">
          {/* Header */}
          <div className="flex items-center text-xs text-gray-400 font-medium pb-1 border-b border-gray-100 dark:border-gray-700">
            <span className="w-8 text-center">#</span>
            <span className="flex-1 text-center">Weight</span>
            <span className="flex-1 text-center">Reps</span>
            <span className="w-28" />
          </div>

          {sets.map((set, idx) => {
            const isLast = idx === sets.length - 1;
            const isPR = prSetIds.has(set.id);

            if (editingSetId === set.id) {
              return (
                <div key={set.id} className="flex items-center gap-2 py-1">
                  <span className="w-6 text-center text-sm text-gray-400 flex-shrink-0">{set.set_number}</span>
                  <input type="number" placeholder="kg" value={editWeight} onChange={e => setEditWeight(e.target.value)}
                    min="0" step="0.5"
                    className="flex-1 min-w-0 px-2 py-2 text-sm border-2 border-green-400 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:outline-none" />
                  <input type="number" placeholder="reps" value={editReps} onChange={e => setEditReps(e.target.value)} min="1"
                    className="flex-1 min-w-0 px-2 py-2 text-sm border-2 border-green-400 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:outline-none" />
                  <button onClick={() => handleEditSave(set.id)} disabled={saving}
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white transition-colors">
                    <SaveIcon />
                  </button>
                  <button onClick={() => setEditingSetId(null)}
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <XIcon />
                  </button>
                </div>
              );
            }

            return (
              <div key={set.id} className="flex items-center py-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span className="w-8 text-center text-sm text-gray-400 flex-shrink-0 font-medium">{set.set_number}</span>
                <span className="flex-1 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  {set.weight_kg ? `${Math.round(set.weight_kg * 10) / 10}kg` : '—'}
                  {isPR && <span className="ml-1 text-xs text-yellow-500 font-bold">PR</span>}
                </span>
                <span className="flex-1 text-center text-sm font-semibold text-gray-900 dark:text-white">{set.reps}</span>
                <div className="flex items-center gap-0.5 w-28 justify-end flex-shrink-0">
                  {isLast && (
                    <button
                      onClick={() => { setWeight(set.weight_kg?.toString() ?? ''); setReps(set.reps.toString()); }}
                      title="Repeat this set"
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-90 transition-all"
                    >
                      <RepeatIcon />
                    </button>
                  )}
                  <button onClick={() => handleEditStart(set)} title="Edit set"
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-90 transition-all">
                    <PencilIcon />
                  </button>
                  <button onClick={() => onDeleteSet(set.id, exercise.exercise_id)} title="Delete set"
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90 transition-all">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 space-y-2">
        <div className="flex items-center gap-2">
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
        {/* Feature 8: overload nudge */}
        {showNudge && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Last session: {prevBest!.weight_kg}kg × {prevBest!.reps} — try adding 2.5kg!
          </p>
        )}
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

// SVG icon components — consistent size, no emoji rendering issues
function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
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
