import Navbar from '@/components/Navbar';
import { DashboardSkeleton } from '@/components/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <DashboardSkeleton />
    </div>
  );
}
