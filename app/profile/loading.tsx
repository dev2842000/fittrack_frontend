import Navbar from '@/components/Navbar';
import { ProfileSkeleton } from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <ProfileSkeleton />
    </div>
  );
}
