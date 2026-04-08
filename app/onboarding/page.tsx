'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const GOALS = [3, 4, 5, 6, 7];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 fields
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('');

  // Step 2 field
  const [goal, setGoal] = useState(4);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        age: age ? parseInt(age) : null,
        sex: sex || null,
        height_cm: height ? parseFloat(height) : null,
      });
      setStep(2);
    } catch {
      setStep(2); // proceed even if save fails
    } finally {
      setSaving(false);
    }
  };

  const handleGoalSave = async () => {
    setSaving(true);
    try {
      await api.put('/goals', { weekly_target: goal });
    } catch {}
    setStep(3);
    setSaving(false);
  };

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_done', '1');
    }
    router.replace('/dashboard');
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map(s => (
            <span
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-green-500' : s < step ? 'w-2 bg-green-300' : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-6 text-center">
              <p className="text-4xl mb-2">👋</p>
              <h1 className="text-xl font-extrabold text-white">Welcome to FitTrack!</h1>
              <p className="text-green-100 text-sm mt-1">Let's set up your profile for better health metrics</p>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Age">
                <input
                  type="number" min="10" max="120" placeholder="e.g. 25"
                  value={age} onChange={e => setAge(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Sex">
                <select value={sex} onChange={e => setSex(e.target.value)} className={inputCls}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Height (cm)">
                <input
                  type="number" min="100" max="250" step="0.1" placeholder="e.g. 175"
                  value={height} onChange={e => setHeight(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 rounded-xl text-sm font-semibold"
                >
                  Skip
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/25 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Continue →'}
                </button>
              </div>
              <p className="text-center text-xs text-gray-400">Used to calculate BMI, BMR & body fat estimates</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6 text-center">
              <p className="text-4xl mb-2">🎯</p>
              <h1 className="text-xl font-extrabold text-white">Set Your Weekly Goal</h1>
              <p className="text-blue-100 text-sm mt-1">How many workouts per week do you want to hit?</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-center gap-3 flex-wrap">
                {GOALS.map(g => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-14 h-14 rounded-2xl text-xl font-extrabold transition-all ${
                      goal === g
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                {goal}x per week
                {goal <= 3 ? ' — Great start!' : goal <= 5 ? ' — Solid commitment!' : ' — You mean business!'}
              </p>
              <button
                onClick={handleGoalSave}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Set Goal →'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white" />
                <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white" />
              </div>
              <div className="relative">
                <p className="text-5xl mb-3">🎉</p>
                <h1 className="text-2xl font-extrabold text-white">You're all set!</h1>
                <p className="text-green-100 text-sm mt-1">Time to start tracking your gains</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { icon: '💪', title: 'Log your first workout', desc: 'Pick exercises and start tracking sets' },
                  { icon: '🏆', title: 'Hit a PR', desc: 'We auto-detect personal records in real time' },
                  { icon: '📈', title: 'Watch yourself grow', desc: 'Charts update after every session' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-base font-bold shadow-xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                Let's go →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm';
