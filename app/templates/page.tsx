'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { getCached, setCached } from '@/lib/cache';

interface Template {
  id: number;
  name: string;
  created_at: string;
  exercise_count: number;
  exercise_names: string[];
}

export default function TemplatesPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <TemplateList />
      </div>
    </AuthGuard>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

function TemplateList() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [starting, setStarting] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

  useEffect(() => {
    const cached = getCached<Template[]>('templates_list');
    if (cached) { setTemplates(cached); setLoading(false); }
    api.get('/templates').then(r => {
      setTemplates(r.data.templates);
      setCached('templates_list', r.data.templates);
    }).finally(() => setLoading(false));
  }, []);

  const handleStart = async (templateId: number) => {
    setStarting(templateId);
    try {
      await api.post(`/workouts/from-template/${templateId}`);
      router.push(`/workout/log?template=${templateId}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        router.push('/workout/log');
      } else {
        alert(err.response?.data?.error || 'Failed to start workout');
      }
    } finally {
      setStarting(null);
    }
  };

  const handleDuplicate = async (templateId: number) => {
    setDuplicatingId(templateId);
    try {
      await api.post(`/templates/${templateId}/duplicate`);
      const res = await api.get('/templates');
      setTemplates(res.data.templates);
    } catch {
      alert('Failed to duplicate template');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Delete this template?')) return;
    setDeletingId(templateId);
    try {
      await api.delete(`/templates/${templateId}`);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch {
      alert('Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Templates</h1>
            <p className="text-green-100 text-sm mt-1 font-medium">
              Saved workout routines — start one in seconds
            </p>
          </div>
          <button
            onClick={() => router.push('/templates/create')}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/5" />
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3.5 w-3/5 mt-1" />
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">No templates yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-xs mx-auto">
            Create a template from scratch or save a completed workout as a template
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-6">
            <button
              onClick={() => router.push('/templates/create')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:scale-105 transition-all text-sm"
            >
              + Create template
            </button>
            <button
              onClick={() => router.push('/workout/log')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
            >
              Start a workout →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-base truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.exercise_count} exercise{t.exercise_count !== 1 ? 's' : ''} ·{' '}
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {t.exercise_names.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {t.exercise_names.slice(0, 5).join(' · ')}
                      {t.exercise_names.length > 5 && ` +${t.exercise_names.length - 5} more`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStart(t.id)}
                    disabled={starting === t.id}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    {starting === t.id ? '...' : '▶ Start'}
                  </button>
                  <button
                    onClick={() => router.push(`/templates/${t.id}/edit`)}
                    className="px-4 py-2 text-sm text-blue-500 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(t.id)}
                    disabled={duplicatingId === t.id}
                    className="px-4 py-2 text-sm text-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {duplicatingId === t.id ? '...' : 'Copy'}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="px-4 py-2 text-sm text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    {deletingId === t.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
