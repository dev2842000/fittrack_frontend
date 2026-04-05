'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useWorkout, WorkoutExercise } from '@/hooks/useWorkout';
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

function WorkoutTracker() {
  const { workout, loading, startWorkout, logSet, deleteSet, completeWorkout, discardWorkout } = useWorkout();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [localExercises, setLocalExercises] = useState<LocalExercise[]>([]);

  // Auto-open name modal when no active workout
  useEffect(() => {
    if (!loading && !workout) setShowNameModal(true);
  }, [loading, workout]);

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
  };

  const handleStart = async (name: string) => {
    setShowNameModal(false);
    setStarting(true);
    try { await startWorkout(name.trim() || undefined); } finally { setStarting(false); }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeWorkout();
      router.push('/workout');
    } finally { setCompleting(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
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
            onCancel={() => router.replace('/workout')}
          />
        )}
      </>
    );
  }

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalExercises = workout.exercises.length + localExercises.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-green-200 dark:border-green-800">
        <div>
          <p className="text-xs text-green-500 font-semibold uppercase tracking-wider">Workout in progress</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Started {new Date(workout.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            {totalExercises > 0 && ` · ${totalExercises} exercises · ${totalSets} sets`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirmDiscard(true)}
            className="px-3 py-1.5 text-sm text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleComplete}
            disabled={completing || totalSets === 0}
            className="px-4 py-1.5 text-sm bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {completing ? 'Finishing...' : 'Finish'}
          </button>
        </div>
      </div>

      {totalExercises === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>No exercises yet — add one below</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map(ex => (
            <ExerciseCard
              key={ex.exercise_id}
              exercise={ex}
              onLogSet={handleLogSet}
              onDeleteSet={deleteSet}
            />
          ))}
          {localExercises.map(ex => (
            <ExerciseCard
              key={`local-${ex.exercise_id}`}
              exercise={{ ...ex, sets: [] }}
              onLogSet={handleLogSet}
              onDeleteSet={deleteSet}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setShowExercisePicker(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-500 rounded-xl transition-colors font-medium"
      >
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
          message="All logged sets will be lost. This can't be undone."
          confirmLabel="Discard"
          confirmClass="bg-red-500 hover:bg-red-600"
          onConfirm={async () => { await discardWorkout(); setShowConfirmDiscard(false); }}
          onCancel={() => setShowConfirmDiscard(false)}
        />
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  onLogSet,
  onDeleteSet,
}: {
  exercise: WorkoutExercise | (LocalExercise & { sets: [] });
  onLogSet: (id: number, name: string, muscle: string, weight: number | null, reps: number) => Promise<void>;
  onDeleteSet: (setId: number, exerciseId: number) => Promise<void>;
}) {
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const [weight, setWeight] = useState(lastSet?.weight_kg?.toString() || '');
  const [reps, setReps] = useState(lastSet?.reps?.toString() || '');
  const [logging, setLogging] = useState(false);

  const handleLog = async () => {
    if (!reps || parseInt(reps) < 1) return;
    setLogging(true);
    try {
      await onLogSet(
        exercise.exercise_id,
        exercise.exercise_name,
        exercise.muscle_group,
        weight ? parseFloat(weight) : null,
        parseInt(reps)
      );
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{exercise.exercise_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{exercise.muscle_group}</p>
        </div>
        <span className="text-sm text-gray-400">{exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}</span>
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
              <button
                onClick={() => onDeleteSet(set.id, exercise.exercise_id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-xs justify-self-end"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
        <input
          type="number"
          placeholder="kg"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          min="0"
          step="0.5"
          className="w-20 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="number"
          placeholder="reps"
          value={reps}
          onChange={e => setReps(e.target.value)}
          min="1"
          className="w-20 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleLog}
          disabled={logging || !reps}
          className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {logging ? '...' : '+ Log Set'}
        </button>
      </div>
    </div>
  );
}

function WorkoutNameModal({ onStart, onCancel }: { onStart: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const suggestions = ['Chest Day', 'Back Day', 'Leg Day', 'Push Day', 'Pull Day', 'Shoulder Day', 'Arms Day', 'Full Body'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Name your workout</h3>
        <input
          autoFocus
          type="text"
          placeholder="e.g. Chest Day, Pull Day..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onStart(name)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => setName(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                name === s
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={() => onStart(name)}
            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {name.trim() ? 'Start' : 'Start (unnamed)'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExercisePicker({
  onClose,
  onAdd,
  workoutExercises,
  localExercises,
}: {
  workoutExercises: WorkoutExercise[];
  localExercises: LocalExercise[];
  onClose: () => void;
  onAdd: (id: number, name: string, muscle: string) => void;
}) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);

  useEffect(() => {
    api.get('/exercises/muscle-groups').then(res => setMuscleGroups(res.data.muscleGroups));
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg">←</button>
        <h2 className="font-semibold text-gray-900 dark:text-white flex-1">Add Exercise</h2>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
        <input
          autoFocus
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', ...muscleGroups].map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeGroup === g ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {filtered.map(ex => {
          const added = alreadyAdded.has(ex.id);
          return (
            <button
              key={ex.id}
              onClick={() => !added && onAdd(ex.id, ex.name, ex.muscle_group)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                added ? 'opacity-40 cursor-default' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{ex.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ex.muscle_group}</p>
              </div>
              {added ? (
                <span className="text-xs text-green-500 font-medium">Added</span>
              ) : (
                <span className="text-green-500 text-lg">+</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConfirmModal({
  title, message, confirmLabel, confirmClass, onConfirm, onCancel,
}: {
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
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            disabled={loading}
            className={`flex-1 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
