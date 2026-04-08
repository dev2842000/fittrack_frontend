'use client';

import { useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(28px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Feature card data ─── */
const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Track Every Set',
    desc: 'Log weight, reps and sets in real-time. Previous bests auto-filled so you always know what to beat.',
    color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
      </svg>
    ),
    title: 'Workout Templates',
    desc: 'Save your favourite routines as templates. Start Push Day in one tap — no setup, no friction.',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Progress Charts',
    desc: 'See your strength curve over time for every exercise. Spot plateaus and breaking points instantly.',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
    title: 'Personal Records',
    desc: 'PRs detected automatically mid-workout. 🏆 badge appears the moment you lift heavier than ever.',
    color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Rest Timer',
    desc: 'Built-in configurable rest timer (60s–3m) starts automatically after each set. Never over-rest again.',
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Health Metrics',
    desc: 'BMI, BMR, maintenance calories and estimated body fat — all calculated from your own logged data.',
    color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    title: 'Streak Tracking',
    desc: 'Your workout streak updates after every session. Hit milestones and get notified to keep the fire going.',
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Weekly Goals',
    desc: 'Set a weekly workout target. Track your progress through the week and get notified when you hit it.',
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  },
];

const steps = [
  { step: '01', title: 'Create your account', desc: 'Sign up free. Set your age, height and weekly goal.' },
  { step: '02', title: 'Log your first workout', desc: 'Pick exercises, log sets with weight & reps, and start tracking.' },
  { step: '03', title: 'Watch yourself improve', desc: 'Charts, PRs, streaks and health metrics update automatically.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="text-lg font-extrabold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent tracking-tight">
            FitTrack
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:scale-105 active:scale-95 transition-all">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-5 text-center max-w-3xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Free to use · No credit card
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            The gym tracker that{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
              actually works
            </span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Log sets, hit PRs, build streaks and see your strength grow — all in one clean app built for people who take training seriously.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-all text-base">
              Start tracking free →
            </Link>
            <Link href="/login"
              className="px-8 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all text-base">
              Sign in
            </Link>
          </div>
        </Reveal>

        {/* Floating stat pills */}
        <Reveal delay={340}>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { value: '50+', label: 'Exercises' },
              { value: 'PRs', label: 'Auto-detected' },
              { value: '100%', label: 'Free' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <span className="text-xl font-extrabold text-green-500">{s.value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-5 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need to progress</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto">
                No fluff. Every feature is built around one goal — helping you lift more next session.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{f.title}</h3>
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Up and running in 60 seconds</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 text-base">No tutorial. No onboarding flow. Just open and go.</p>
            </div>
          </Reveal>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 100}>
                <div className="flex items-start gap-5 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <span className="text-3xl font-extrabold text-green-500/30 dark:text-green-400/30 leading-none flex-shrink-0 w-12 text-center">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{s.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-5">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-10 shadow-2xl shadow-green-500/30 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white" />
              <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-white" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Ready to start lifting smarter?</h2>
              <p className="mt-3 text-green-100 text-base">Free forever. No ads. No subscriptions.</p>
              <Link href="/register"
                className="mt-8 inline-block px-10 py-3.5 bg-white hover:bg-green-50 text-green-600 font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-base">
                Create free account →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      {/* <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800">
        © {new Date().getFullYear()} FitTrack. All rights reserved.
      </footer> */}
    </div>
  );
}
