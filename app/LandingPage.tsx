'use client';

import { useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/hooks/useDarkMode';

function Reveal({ children, delay = 0, className = '' }: {
  children: ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'none'; io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: 0, transform: 'translateY(30px)', transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const features = [
  { n: '01', title: 'Track Every Set', desc: 'Log weight, reps and sets in real-time. Previous bests auto-filled so you always know what to beat.' },
  { n: '02', title: 'Workout Templates', desc: 'Save your favourite routines. Start Push Day in one tap — no setup, no friction.' },
  { n: '03', title: 'Progress Charts', desc: 'See your strength curve over time for every exercise. Spot plateaus and breaking points instantly.' },
  { n: '04', title: 'Auto-Detected PRs', desc: '🏆 badge appears the moment you lift heavier than ever. Mid-workout, real-time.' },
  { n: '05', title: 'Rest Timer', desc: 'Configurable rest timer (60s–3m) starts automatically after each set. Never over-rest.' },
  { n: '06', title: 'Health Metrics', desc: 'BMI, BMR, maintenance calories and body fat — calculated from your own logged data.' },
  { n: '07', title: 'Streak Tracking', desc: 'Workout streak updates after every session. Hit milestones and keep the fire going.' },
  { n: '08', title: 'Weekly Goals', desc: 'Set a weekly workout target. Track progress through the week and get notified.' },
];

const steps = [
  { n: '01', title: 'Create your account', desc: 'Sign up free. Set your age, height and weekly goal. Takes 30 seconds.' },
  { n: '02', title: 'Log your first workout', desc: 'Pick exercises from 50+ library or create custom. Log sets with weight & reps.' },
  { n: '03', title: 'Watch yourself improve', desc: 'Charts, PRs, streaks and health metrics update automatically after every session.' },
];

const marqueeItems = ['Track Sets', 'Hit PRs', 'Build Streaks', 'Beat Yourself', 'Log Progress', 'Get Stronger', 'Stay Consistent', 'No Excuses'];

export default function LandingPage() {
  const { isDark, toggle, mounted } = useDarkMode();

  return (
    <>

      <div className="ft-grain ft-body min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white overflow-x-hidden">

        {/* ── Nav ── */}
        <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 dark:border-white/[0.06] bg-gray-50/95 dark:bg-[#070707]/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <span className="ft-display text-2xl text-green-500 dark:text-[#00ff88]">FITTRACK</span>
            <div className="flex items-center gap-4">
              {mounted && (
                <button
                  onClick={toggle}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white transition-colors"
                >
                  {isDark ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>
              )}
              <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-gray-900 dark:text-white/35 dark:hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register"
                className="px-5 py-2 bg-green-500 dark:bg-[#00ff88] text-white dark:text-black text-sm font-bold uppercase tracking-wider hover:bg-green-600 dark:hover:bg-white dark:hover:text-black transition-colors">
                Get started
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="min-h-screen flex flex-col justify-end pb-16 pt-28 px-6 relative overflow-hidden">
          {/* Grid background — subtle in both modes */}
          <div className="absolute inset-0 opacity-40 dark:opacity-100"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }} />
          <div className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }} />
          {/* Green glow */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-green-400/10 dark:bg-[#00ff88]/5 blur-[120px] pointer-events-none" />

          {/* Corner meta */}
          <div className="absolute top-20 right-6 md:right-12 hidden md:flex flex-col items-end gap-3 text-gray-300 dark:text-white/20 text-[10px] font-mono uppercase tracking-widest ft-hero-5">
            <span className="text-green-400 dark:text-[#00ff88]/50">● Live</span>
            <span className="w-px h-12 bg-gray-200 dark:bg-white/10 self-center" />
            <span>100% Free</span>
          </div>

          <div className="max-w-6xl mx-auto w-full relative">
            {/* Badge */}
            <div className="ft-hero-1 inline-flex items-center gap-2 mb-8 border border-green-300/60 dark:border-[#00ff88]/25 px-4 py-1.5 text-green-600 dark:text-[#00ff88] text-[11px] font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-[#00ff88] ft-blink" />
              Free to use · No credit card required
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12 lg:gap-20 items-end">
              <div>
                <h1 className="ft-display ft-hero-2 text-[clamp(64px,12vw,160px)] leading-[0.88] text-gray-900 dark:text-white">
                  TRAIN<br />
                  SMARTER.<br />
                  <span className="text-green-500 dark:text-[#00ff88]">LIFT</span><br />
                  HARDER.
                </h1>
                <p className="ft-hero-3 mt-8 text-gray-500 dark:text-white/45 text-lg max-w-md leading-relaxed font-light">
                  The gym tracker built for people who take training seriously. Log sets, hit PRs, build streaks — all in one place.
                </p>
                <div className="ft-hero-4 mt-10 flex flex-wrap gap-4 items-center">
                  <Link href="/register"
                    className="px-8 py-4 bg-green-500 dark:bg-[#00ff88] text-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-green-600 dark:hover:bg-white dark:hover:text-black transition-colors">
                    Start tracking free →
                  </Link>
                  <Link href="/login"
                    className="px-8 py-4 border border-gray-300 dark:border-white/15 text-gray-500 dark:text-white/50 font-medium uppercase tracking-widest text-sm hover:border-gray-500 hover:text-gray-900 dark:hover:border-white/40 dark:hover:text-white transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Vertical stat column */}
              <div className="ft-hero-5 hidden lg:flex flex-col gap-8 border-l border-gray-200 dark:border-white/[0.08] pl-10 pb-1">
                {[
                  { value: '50+', label: 'Exercises' },
                  { value: 'PRs', label: 'Auto-detected' },
                  { value: '∞', label: 'Workouts free' },
                  { value: '0', label: 'Ads or upsells' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="ft-display text-[42px] text-green-500 dark:text-[#00ff88] leading-none">{s.value}</div>
                    <div className="text-gray-400 dark:text-white/25 text-[10px] uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom rule */}
            <div className="ft-hero-5 mt-16 flex items-center gap-6">
              <div className="h-px bg-gray-200 dark:bg-white/[0.08] flex-1" />
              <span className="text-gray-300 dark:text-white/15 text-[10px] uppercase tracking-widest">Scroll to explore</span>
              <div className="h-px bg-gray-200 dark:bg-white/[0.08] w-12" />
            </div>
          </div>
        </section>

        {/* ── Marquee ── */}
        <div className="border-y border-gray-200 dark:border-white/[0.06] py-3.5 overflow-hidden bg-green-50 dark:bg-[#00ff88]/[0.03]">
          <div className="ft-marquee flex gap-0 whitespace-nowrap w-max">
            {[0, 1].map(i => (
              <div key={i} className="flex items-center">
                {marqueeItems.map(t => (
                  <span key={t} className="ft-display text-lg text-gray-300 dark:text-white/15 uppercase px-8">
                    {t}<span className="text-green-400 dark:text-[#00ff88]/40 ml-8">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 border-b border-gray-200 dark:border-white/[0.07] pb-8 gap-4">
                <h2 className="ft-display text-[clamp(48px,7vw,80px)] text-gray-900 dark:text-white">FEATURES</h2>
                <p className="text-gray-400 dark:text-white/25 text-sm max-w-xs md:text-right font-light leading-relaxed">
                  No fluff. Every feature built around one goal — help you lift more next session.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-white/[0.06]">
              {features.map((f, i) => (
                <Reveal key={f.n} delay={i * 45}>
                  <div className="bg-gray-50 dark:bg-[#070707] p-6 lg:p-7 hover:bg-white dark:hover:bg-white/[0.025] transition-colors group h-full">
                    <div className="ft-display text-[52px] text-gray-200 dark:text-white/[0.07] group-hover:text-green-200 dark:group-hover:text-[#00ff88]/15 transition-colors leading-none mb-5">
                      {f.n}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white/90 text-[13px] uppercase tracking-wider mb-2.5">{f.title}</h3>
                    <p className="text-gray-500 dark:text-white/30 text-[13px] leading-relaxed font-light">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-24 px-6 border-y border-gray-200 dark:border-white/[0.06] bg-gray-100/60 dark:bg-white/[0.015]">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="ft-display text-[clamp(48px,7vw,80px)] text-gray-900 dark:text-white mb-14">HOW IT WORKS</h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 dark:bg-white/[0.06]">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <div className="bg-gray-50 dark:bg-[#070707] p-10 relative overflow-hidden group hover:bg-white dark:hover:bg-white/[0.02] transition-colors">
                    <div className="ft-display text-[140px] leading-none text-gray-100 dark:text-white/[0.035] absolute -top-6 -left-3 select-none group-hover:text-green-100 dark:group-hover:text-[#00ff88]/[0.04] transition-colors">
                      {s.n}
                    </div>
                    <div className="relative">
                      <div className="w-8 h-[2px] bg-green-500 dark:bg-[#00ff88] mb-7" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-3">{s.title}</h3>
                      <p className="text-gray-500 dark:text-white/35 text-sm leading-relaxed font-light">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <Reveal>
          <div className="border-b border-gray-200 dark:border-white/[0.06] grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-white/[0.06]">
            {[
              { value: '50+', label: 'Built-in exercises' },
              { value: 'Real-time', label: 'PR detection' },
              { value: 'Free', label: 'Forever, no catch' },
              { value: 'PWA', label: 'Works offline' },
            ].map(s => (
              <div key={s.label} className="px-8 py-10 text-center hover:bg-gray-100 dark:hover:bg-white/[0.02] transition-colors">
                <div className="ft-display text-[42px] text-green-500 dark:text-[#00ff88]">{s.value}</div>
                <div className="text-gray-400 dark:text-white/25 text-xs uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── CTA ── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="relative border border-green-200 dark:border-[#00ff88]/15 p-12 md:p-20 group hover:border-green-400 dark:hover:border-[#00ff88]/30 transition-colors overflow-hidden">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-green-400 dark:border-[#00ff88]/40" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-green-400 dark:border-[#00ff88]/40" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-green-400 dark:border-[#00ff88]/40" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-green-400 dark:border-[#00ff88]/40" />
                <div className="absolute inset-0 bg-green-500/[0.02] dark:bg-[#00ff88]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative max-w-2xl">
                  <h2 className="ft-display text-[clamp(48px,8vw,100px)] leading-[0.9] text-gray-900 dark:text-white mb-6">
                    READY TO<br />
                    <span className="text-green-500 dark:text-[#00ff88]">GET STRONGER?</span>
                  </h2>
                  <p className="text-gray-500 dark:text-white/35 text-lg mb-10 font-light max-w-md leading-relaxed">
                    Free forever. No ads. No subscriptions. Just you, the bar, and your progress.
                  </p>
                  <Link href="/register"
                    className="inline-block px-10 py-4 bg-green-500 dark:bg-[#00ff88] text-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-green-600 dark:hover:bg-white dark:hover:text-black transition-colors">
                    Create free account →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-200 dark:border-white/[0.06] py-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="ft-display text-xl text-green-500/70 dark:text-[#00ff88]/50">FITTRACK</span>
            <span className="text-gray-300 dark:text-white/15 text-[10px] uppercase tracking-widest">
              © {new Date().getFullYear()} · Free forever
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
