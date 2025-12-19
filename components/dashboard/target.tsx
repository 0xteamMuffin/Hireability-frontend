'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Target,
  Briefcase,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Building2,
  Loader2,
} from 'lucide-react';
import { targetApi, TargetCompany, CreateTargetInput } from '@/lib/api';

export const TargetPage = () => {
  const [targets, setTargets] = useState<TargetCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newTarget, setNewTarget] = useState<CreateTargetInput>({
    companyName: '',
    role: '',
    websiteLink: '',
  });

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setLoading(true);
    const response = await targetApi.getAll();
    if (response.success && response.data) {
      setTargets(response.data);
    }
    setLoading(false);
  };

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.companyName || !newTarget.role) return;

    setSubmitting(true);
    const response = await targetApi.create(newTarget);

    if (response.success && response.data) {
      setTargets([response.data, ...targets]);
      setNewTarget({ companyName: '', role: '', websiteLink: '' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const response = await targetApi.delete(id);

    if (response.success) {
      setTargets(targets.filter((t) => t.id !== id));
    }
    setDeleting(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Target Companies</h1>
        <p className="mt-1 text-slate-500">Track the companies and roles you are targeting.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <section className="sticky top-6 rounded-4xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <Plus size={18} className="text-indigo-400" /> Add New Target
            </h3>

            <form onSubmit={handleAddTarget} className="space-y-4">
              <div>
                <label className="mb-1.5 ml-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Netflix"
                    value={newTarget.companyName}
                    onChange={(e) => setNewTarget({ ...newTarget, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-slate-800 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Target Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Senior Backend Dev"
                    value={newTarget.role}
                    onChange={(e) => setNewTarget({ ...newTarget, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-slate-800 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Website Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newTarget.websiteLink || ''}
                    onChange={(e) => setNewTarget({ ...newTarget, websiteLink: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-slate-800 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newTarget.companyName || !newTarget.role || submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-400 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Adding...
                  </>
                ) : (
                  'Add Target'
                )}
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
            </div>
          ) : (
            <AnimatePresence>
              {targets.map((target) => (
                <motion.div
                  key={target.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="group flex items-center justify-between rounded-2xl border border-white bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-xl font-bold text-indigo-400">
                      {target.companyName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{target.role}</h4>
                      <p className="font-medium text-slate-500">{target.companyName}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          Added {formatDate(target.createdAt)}
                        </span>
                        {target.websiteLink && (
                          <a
                            href={target.websiteLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-600 hover:underline"
                          >
                            Visit Website <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-xl bg-slate-100 p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-400 disabled:opacity-50"
                      onClick={() => handleDelete(target.id)}
                      disabled={deleting === target.id}
                    >
                      {deleting === target.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && targets.length === 0 && (
            <div className="rounded-4xl border-2 border-dashed border-slate-200 bg-white/40 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                <Target size={32} />
              </div>
              <p className="font-medium text-slate-500">No targets set yet.</p>
              <p className="text-sm text-slate-400">
                Start by adding a company you want to work for.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
