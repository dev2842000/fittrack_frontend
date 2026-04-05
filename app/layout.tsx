import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitTrack — Workout Tracker & Progress Logger',
  description: 'Track your workouts, log sets and reps, monitor personal records, and hit your weekly fitness goals.',
  metadataBase: new URL('https://fittrackfrontend-five.vercel.app'),
  openGraph: {
    title: 'FitTrack — Workout Tracker & Progress Logger',
    description: 'Track your workouts, log sets and reps, monitor personal records, and hit your weekly fitness goals.',
    url: 'https://fittrackfrontend-five.vercel.app',
    siteName: 'FitTrack',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FitTrack — Workout Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitTrack — Workout Tracker & Progress Logger',
    description: 'Track your workouts, log sets and reps, monitor personal records, and hit your weekly fitness goals.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
