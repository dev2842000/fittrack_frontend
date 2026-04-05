import Navbar from '@/components/Navbar';
import { WorkoutDetailSkeleton } from '@/components/Skeleton';

export default function WorkoutDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <WorkoutDetailSkeleton />
    </div>
  );
}
