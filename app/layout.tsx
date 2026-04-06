import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitTrack — Workout Tracker & Progress Logger',
  description: 'Track your workouts, log sets and reps, monitor personal records, and hit your weekly fitness goals.',
  metadataBase: new URL('https://fittrack-frontend-three.vercel.app'),
  openGraph: {
    title: 'FitTrack — Workout Tracker & Progress Logger',
    description: 'Track your workouts, log sets and reps, monitor personal records, and hit your weekly fitness goals.',
    url: 'https://fittrack-frontend-three.vercel.app',
    siteName: 'FitTrack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitTrack — Workout Tracker & Progress Logger',
    description: 'Track your workouts, log sets and reps, monitor personal records, and hit your weekly fitness goals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <footer className="text-center py-4 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          © {new Date().getFullYear()} FitTrack. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
