import Navbar from '@/components/Navbar';
import { ProgressSkeleton } from '@/components/Skeleton';

export default function ProgressLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <ProgressSkeleton />
    </div>
  );
}
