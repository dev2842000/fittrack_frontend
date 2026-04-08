'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { EyeIcon } from '@/components/EyeIcon';

interface Profile {
  id: number;
  name: string;
  email: string;
  age: number | null;
  sex: string | null;
  height_cm: number | null;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <ProfileContent />
      </div>
    </AuthGuard>
  );
}

interface BwEntry { date: string; weight_kg: number; }

function ProfileContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    Promise.all([
      api.get('/profile').then(r => setProfile(r.data.profile)),
      api.get('/progress/bodyweight').then(r => {
        const entries: BwEntry[] = r.data.entries;
        if (entries.length > 0) setLatestWeight(entries[entries.length - 1].weight_kg);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Hero header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-extrabold text-white shadow-lg flex-shrink-0">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{profile.name}</h1>
            <p className="text-green-100 text-sm mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${profile.is_verified ? 'bg-white' : 'bg-yellow-300'}`} />
              <span className="text-xs text-green-100 font-medium">
                {profile.is_verified ? 'Verified account' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-green-200 mt-4">
          Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <EditProfileForm profile={profile} onSave={p => { setProfile(p); }} />
      {(profile.height_cm && profile.age && latestWeight) && (
        <HealthMetrics
          weightKg={latestWeight}
          heightCm={profile.height_cm}
          age={profile.age}
          sex={profile.sex}
        />
      )}
      <ChangePasswordForm />

      {/* Sign out — visible on mobile since navbar hides it */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl border-2 border-red-200 dark:border-red-800 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', desc: 'Little or no exercise', multiplier: 1.2 },
  { label: 'Light', desc: '1–3 days/week', multiplier: 1.375 },
  { label: 'Moderate', desc: '3–5 days/week', multiplier: 1.55 },
  { label: 'Active', desc: '6–7 days/week', multiplier: 1.725 },
  { label: 'Very Active', desc: 'Hard training daily', multiplier: 1.9 },
];

function HealthMetrics({ weightKg, heightCm, age, sex }: {
  weightKg: number; heightCm: number; age: number; sex: string | null;
}) {
  const [activityIdx, setActivityIdx] = useState(1);
  const isMale = sex === 'male';

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Mifflin-St Jeor BMR
  const bmr = isMale
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * ACTIVITY_LEVELS[activityIdx].multiplier);

  // BMI-based body fat estimate (Deurenberg formula)
  const bfPercent = isMale
    ? (1.20 * bmi) + (0.23 * age) - 16.2
    : (1.20 * bmi) + (0.23 * age) - 5.4;

  const bmiCategory =
    bmi < 18.5 ? { label: 'Underweight', color: 'text-blue-500' } :
    bmi < 25   ? { label: 'Normal', color: 'text-green-500' } :
    bmi < 30   ? { label: 'Overweight', color: 'text-yellow-500' } :
                 { label: 'Obese', color: 'text-red-500' };

  const metrics = [
    { label: 'BMI', value: bmi.toFixed(1), sub: bmiCategory.label, subColor: bmiCategory.color },
    { label: 'BMR', value: `${Math.round(bmr)}`, sub: 'kcal/day at rest', subColor: 'text-gray-400' },
    { label: 'Body Fat', value: `${Math.max(0, bfPercent).toFixed(1)}%`, sub: 'estimated', subColor: 'text-gray-400' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <h2 className="font-bold text-white text-base">Health Metrics</h2>
        <p className="text-blue-100 text-xs mt-0.5">Based on your latest weight ({weightKg}kg)</p>
      </div>
      <div className="p-5 space-y-5">
        {/* BMI · BMR · Body Fat */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{m.label}</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">{m.value}</p>
              <p className={`text-[11px] font-medium mt-0.5 ${m.subColor}`}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Maintenance calories with activity picker */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Maintenance Calories</p>
              <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-0.5">{tdee.toLocaleString()} <span className="text-base font-semibold text-gray-400">kcal/day</span></p>
            </div>
            <div className="text-right text-xs text-gray-400">
              <p>Cut: <span className="font-bold text-red-400">{(tdee - 500).toLocaleString()}</span></p>
              <p>Bulk: <span className="font-bold text-blue-400">{(tdee + 300).toLocaleString()}</span></p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400 font-medium">Activity level</p>
            <div className="flex gap-1.5 flex-wrap">
              {ACTIVITY_LEVELS.map((a, i) => (
                <button key={a.label} onClick={() => setActivityIdx(i)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activityIdx === i
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                  }`}>
                  {a.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">{ACTIVITY_LEVELS[activityIdx].desc}</p>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          Estimates only — update your weight on the Progress page for accurate results
        </p>
      </div>
    </div>
  );
}

function EditProfileForm({ profile, onSave }: { profile: Profile; onSave: (p: Profile) => void }) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age?.toString() ?? '');
  const [sex, setSex] = useState(profile.sex ?? '');
  const [height, setHeight] = useState(profile.height_cm?.toString() ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const res = await api.put('/profile', {
        name: name.trim(),
        age: age ? parseInt(age) : null,
        sex: sex || null,
        height_cm: height ? parseFloat(height) : null,
        bio: bio.trim() || null,
      });
      onSave(res.data.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <h2 className="font-bold text-white text-base">✏️ Personal Details</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-xl font-medium">
            ✓ Profile saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name">
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={profile.email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
          </Field>
          <Field label="Age">
            <input type="number" value={age} onChange={e => setAge(e.target.value)} min="10" max="120" placeholder="e.g. 24" className={inputCls} />
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
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} min="100" max="250" step="0.1" placeholder="e.g. 175" className={inputCls} />
          </Field>
        </div>

        <Field label="Bio">
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="A few words about yourself..." className={`${inputCls} resize-none`} />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 active:scale-95"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await api.put('/profile/password', { currentPassword: current, newPassword: next });
      setSuccess(true);
      setCurrent('');
      setNext('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
        <h2 className="font-bold text-white text-base">🔒 Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-xl font-medium">
            ✓ Password updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Current Password">
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                required
                placeholder="••••••••"
                className={`${inputCls} pr-10`}
              />
              <button type="button" onClick={() => setShowCurrent(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </Field>
          <Field label="New Password">
            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                value={next}
                onChange={e => setNext(e.target.value)}
                required
                placeholder="Min 6 characters"
                className={`${inputCls} pr-10`}
              />
              <button type="button" onClick={() => setShowNext(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <EyeIcon open={showNext} />
              </button>
            </div>
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 dark:from-gray-600 dark:to-gray-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
        >
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
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

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200';
