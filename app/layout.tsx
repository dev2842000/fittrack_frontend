import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitTrack — Workout Tracker & Progress Logger',
  description: 'Track your workouts, log sets and reps, monitor personal records, and hit your weekly fitness goals.',
  metadataBase: new URL('https://fittrack-frontend-three.vercel.app'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FitTrack',
  },
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
      <head>
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <footer className="text-center py-4 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          © {new Date().getFullYear()} FitTrack. All rights reserved.
        </footer>
      <div className="sm:hidden h-20" />

      </body>
    </html>
  );
}
