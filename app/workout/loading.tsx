import Navbar from '@/components/Navbar';
import { WorkoutHistorySkeleton } from '@/components/Skeleton';

export default function WorkoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <WorkoutHistorySkeleton />
    </div>
  );
}
