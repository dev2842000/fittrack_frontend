import Navbar from '@/components/Navbar';
import { MonthlyDetailSkeleton } from '@/components/Skeleton';

export default function MonthlyDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <MonthlyDetailSkeleton />
    </div>
  );
}
