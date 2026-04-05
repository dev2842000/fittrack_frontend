'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Summary {
  totalWorkouts: number;
  topLifts: { exercise_name: string; max_weight: number }[];
}

interface ProgressPoint {
  date: string;
  maxWeight: number;
  volume: number;
  sets: number;
  isPR: boolean;
}

interface Exercise { id: number; name: string; muscle_group: string; }
interface PR { exercise_name: string; muscle_group: string; max_weight: number; reps_at_max: number; }
interface BwEntry { date: string; weight_kg: number; }

export default function ProgressPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <ProgressDashboard />
      </div>
    </AuthGuard>
  );
}

function ProgressDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [progressData, setProgressData] = useState<ProgressPoint[]>([]);
  const [pr, setPr] = useState<{ weight: number | null; reps: number | null }>({ weight: null, reps: null });
  const [prs, setPrs] = useState<PR[]>([]);
  const [bwEntries, setBwEntries] = useState<BwEntry[]>([]);
  const [bwInput, setBwInput] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    api.get('/progress/summary').then(r => setSummary(r.data));
    api.get('/progress/exercises').then(r => setExercises(r.data.exercises));
    api.get('/progress/prs').then(r => setPrs(r.data.prs));
    api.get('/progress/bodyweight').then(r => setBwEntries(r.data.entries));
  }, []);

  useEffect(() => {
    if (!selectedEx) return;
    setLoadingProgress(true);
    api.get(`/progress/exercise/${selectedEx.id}`)
      .then(r => { setProgressData(r.data.data); setPr(r.data.pr); })
      .finally(() => setLoadingProgress(false));
  }, [selectedEx]);

  const handleLogBw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bwInput) return;
    const res = await api.post('/progress/bodyweight', { weight_kg: parseFloat(bwInput) });
    setBwEntries(prev => {
      const date = res.data.entry.logged_date;
      const filtered = prev.filter(e => e.date !== date);
      return [...filtered, { date, weight_kg: parseFloat(res.data.entry.weight_kg) }].sort((a, b) => a.date.localeCompare(b.date));
    });
    setBwInput('');
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const rankBadge = (i: number) => {
    const configs: { bg: string; text: string; label: string }[] = [
      { bg: 'bg-yellow-400', text: 'text-yellow-900', label: '🥇' },
      { bg: 'bg-gray-300 dark:bg-gray-500', text: 'text-gray-800 dark:text-white', label: '🥈' },
      { bg: 'bg-orange-400', text: 'text-orange-900', label: '🥉' },
    ];
    if (i < 3) return configs[i];
    return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', label: `#${i + 1}` };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-4 w-28 h-28 rounded-full bg-white" />
        </div>
        <div className="relative">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">📈 Progress</h1>
          <p className="text-green-100 text-sm mt-1 font-medium">Track your gains and personal records</p>
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Workouts" value={summary.totalWorkouts} icon="💪" accent="green" />
          <StatCard label="Exercises Tracked" value={exercises.length} icon="📊" accent="blue" />
        </div>
      )}

      {/* Exercise progress */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Gradient header bar */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-white text-base">Exercise Progress</h2>
          <select
            value={selectedEx?.id ?? ''}
            onChange={e => {
              const ex = exercises.find(x => x.id === parseInt(e.target.value));
              setSelectedEx(ex || null);
            }}
            className="px-3 py-1.5 text-sm border-0 rounded-xl bg-white/20 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
          >
            <option value="" className="text-gray-900">Select exercise</option>
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id} className="text-gray-900">{ex.name}</option>
            ))}
          </select>
        </div>

        <div className="p-5 space-y-4">
          {!selectedEx ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="font-medium">Select an exercise to see your progress</p>
            </div>
          ) : loadingProgress ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : progressData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3">📭</span>
              <p className="font-medium">No data yet for {selectedEx.name}</p>
            </div>
          ) : (
            <>
              {/* PR badge */}
              {pr.weight && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/40 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-xl text-sm font-bold">
                  🏆 PR: {pr.weight}kg {pr.reps ? `× ${pr.reps} reps` : ''}
                </div>
              )}

              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={progressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="kg" />
                  <Tooltip
                    formatter={(v: number) => [`${Math.round(v)}kg`, 'Max Weight']}
                    labelFormatter={fmt}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={({ cx, cy, payload }) =>
                      payload.isPR ? (
                        <circle key={`pr-${cx}-${cy}`} cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                      ) : (
                        <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3.5} fill="#22c55e" stroke="#fff" strokeWidth={1.5} />
                      )
                    }
                  />
                </LineChart>
              </ResponsiveContainer>

              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" /> Yellow dots = personal records
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Records */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-4">
            <h2 className="font-bold text-white text-base">🏆 Personal Records</h2>
          </div>
          <div className="p-5 space-y-1">
            {prs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-3xl block mb-2">🎯</span>
                <p className="text-sm font-medium">No PRs yet — complete some workouts!</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {prs.map((pr, i) => {
                  const badge = rankBadge(i);
                  return (
                    <div
                      key={pr.exercise_name}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                          {badge.label}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{pr.exercise_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{pr.muscle_group}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-extrabold text-green-500">{Math.round(pr.max_weight)}<span className="text-xs font-semibold text-gray-400">kg</span></p>
                        {pr.reps_at_max && <p className="text-xs text-gray-400">× {pr.reps_at_max} reps</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bodyweight */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4">
            <h2 className="font-bold text-white text-base">⚖️ Bodyweight</h2>
          </div>
          <div className="p-5 space-y-4">
            <form onSubmit={handleLogBw} className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Enter kg..."
                value={bwInput}
                onChange={e => setBwInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/25"
              >
                Log today
              </button>
            </form>

            {bwEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-3xl block mb-2">⚖️</span>
                <p className="text-sm font-medium">No bodyweight data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={bwEntries} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bwGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="kg" domain={['auto', 'auto']} width={55} />
                  <Tooltip
                    formatter={(v: number) => [`${v}kg`, 'Weight']}
                    labelFormatter={fmt}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight_kg"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#bwGradient)"
                    dot={{ r: 3.5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon?: string; accent?: 'green' | 'blue' }) {
  const accentBorder = accent === 'blue' ? 'border-l-4 border-blue-400' : 'border-l-4 border-green-400';
  const numColor = accent === 'blue' ? 'text-blue-500' : 'text-green-500';
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex items-center gap-4 ${accentBorder}`}>
      {icon && <span className="text-3xl">{icon}</span>}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-4xl font-extrabold mt-0.5 ${numColor}`}>{value}</p>
      </div>
    </div>
  );
}
