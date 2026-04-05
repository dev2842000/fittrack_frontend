import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitTrack',
  description: 'Track your workouts, progress, and personal records',
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
