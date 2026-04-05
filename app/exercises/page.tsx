import ExerciseLibrary from './ExerciseLibrary';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  is_custom: boolean;
}

// ISR — rebuild every 24 hours. Default exercises rarely change.
export const revalidate = 86400;

async function getDefaultExercises(): Promise<Exercise[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/exercises/default`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.exercises.map((e: Exercise) => ({ ...e, is_custom: false }));
  } catch {
    return [];
  }
}

export default async function ExercisesPage() {
  const defaultExercises = await getDefaultExercises();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <ExerciseLibrary initialExercises={defaultExercises} />
      </div>
    </AuthGuard>
  );
}
