'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface WorkoutSet {
  id: number;
  set_number: number;
  weight_kg: number | null;
  reps: number;
}

export interface WorkoutExercise {
  exercise_id: number;
  exercise_name: string;
  muscle_group: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: number;
  name: string | null;
  started_at: string;
  completed_at: string | null;
  exercises: WorkoutExercise[];
}

export interface PreviousBest {
  weight_kg: number | null;
  reps: number;
}

export function useWorkout() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [previousBest, setPreviousBest] = useState<Record<number, PreviousBest>>({});
  const [loading, setLoading] = useState(true);

  const fetchActive = useCallback(async () => {
    try {
      const res = await api.get('/workouts/active');
      setWorkout(res.data.workout);
      setPreviousBest(res.data.previousBest || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActive(); }, [fetchActive]);

  const startWorkout = async (name?: string) => {
    const res = await api.post('/workouts', { name });
    const newWorkout = { ...res.data.workout, exercises: [] };
    setWorkout(newWorkout);
    return newWorkout;
  };

  const startFromTemplate = async (templateId: number) => {
    const res = await api.post(`/workouts/from-template/${templateId}`);
    const newWorkout = { ...res.data.workout, exercises: [] };
    setWorkout(newWorkout);
    return { workout: newWorkout, templateExercises: res.data.templateExercises };
  };

  const logSet = async (exerciseId: number, exerciseName: string, muscleGroup: string, weightKg: number | null, reps: number) => {
    if (!workout) return;
    const res = await api.post(`/workouts/${workout.id}/sets`, {
      exercise_id: exerciseId,
      weight_kg: weightKg,
      reps,
    });
    const newSet: WorkoutSet = res.data.set;

    setWorkout(prev => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const idx = exercises.findIndex(e => e.exercise_id === exerciseId);
      if (idx === -1) {
        exercises.push({ exercise_id: exerciseId, exercise_name: exerciseName, muscle_group: muscleGroup, sets: [newSet] });
      } else {
        exercises[idx] = { ...exercises[idx], sets: [...exercises[idx].sets, newSet] };
      }
      return { ...prev, exercises };
    });
  };

  const deleteSet = async (setId: number, exerciseId: number) => {
    if (!workout) return;
    await api.delete(`/workouts/${workout.id}/sets/${setId}`);
    setWorkout(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map(ex => {
        if (ex.exercise_id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }).filter(ex => ex.sets.length > 0);
      return { ...prev, exercises };
    });
  };

  const completeWorkout = async () => {
    if (!workout) return;
    await api.patch(`/workouts/${workout.id}/complete`);
    const completedId = workout.id;
    setWorkout(null);
    return completedId;
  };

  const discardWorkout = async () => {
    if (!workout) return;
    await api.delete(`/workouts/${workout.id}`);
    setWorkout(null);
  };

  return { workout, loading, previousBest, startWorkout, startFromTemplate, logSet, deleteSet, completeWorkout, discardWorkout };
}
