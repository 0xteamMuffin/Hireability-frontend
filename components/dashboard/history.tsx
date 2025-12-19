'use client';

import { useEffect, useState } from 'react';
import { History, Calendar, CheckCircle2, MoreVertical, Loader2, Trash2 } from 'lucide-react';
import { vapiApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks';
import { InterviewWithAnalysis } from '@/lib/types';

export const HistoryPage = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) return;
      try {
        const response = await vapiApi.getInterviews();
        if (response.success && response.data) {
          setInterviews(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this interview?')) return;

    try {
      setDeletingId(id);
      await vapiApi.deleteInterview(id);
      setInterviews((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete interview', error);
      alert('Failed to delete interview');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const getScore = (interview: InterviewWithAnalysis) => {
    if (
      interview.analysis?.overall &&
      typeof interview.analysis.overall === 'object' &&
      'score' in interview.analysis.overall
    ) {
      return (interview.analysis.overall as any).score;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={40} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-800">History</h1>

      <div className="overflow-hidden rounded-[2rem] border border-white bg-white/60 shadow-sm backdrop-blur-md">
        {interviews.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-300">
              <History size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">No Past Interviews</h2>
            <p className="text-slate-500">Start a new session to see your history here.</p>
          </div>
        ) : (
          interviews.map((item) => {
            const score = getScore(item);
            return (
              <div
                key={item.id}
                className="flex cursor-pointer items-center justify-between border-b border-slate-100 p-5 transition-colors last:border-0 hover:bg-white/80"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-400">
                    I
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Mock Interview</h4>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} /> {formatDate(item.startedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden text-right sm:block">
                    <span className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      Score
                    </span>
                    <span
                      className={`font-bold ${
                        score && score >= 80 ? 'text-green-500' : 'text-orange-500'
                      }`}
                    >
                      {score ? `${score}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    <CheckCircle2 size={12} /> {item.endedAt ? 'Completed' : 'In Progress'}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
