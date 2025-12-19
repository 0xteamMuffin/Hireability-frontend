'use client';

import { motion } from 'framer-motion';
import {
  BarChart2,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Eye,
  Loader2,
  Users,
  Cpu,
  Code,
  Network,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { vapiApi, sessionApi } from '@/lib/api';
import {
  InterviewWithAnalysis,
  AnalysisDimension,
  InterviewSession,
  RoundType,
  InterviewStatus,
  SessionStatus,
  ROUND_DISPLAY_INFO,
} from '@/lib/types';
import { useAuth } from '@/lib/hooks';

const ROUND_ICONS: Record<RoundType, React.ReactNode> = {
  [RoundType.BEHAVIORAL]: <Users size={18} />,
  [RoundType.TECHNICAL]: <Cpu size={18} />,
  [RoundType.CODING]: <Code size={18} />,
  [RoundType.SYSTEM_DESIGN]: <Network size={18} />,
  [RoundType.HR]: <Briefcase size={18} />,
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getScore = (dimension: AnalysisDimension | null | undefined): number | null => {
  if (!dimension || typeof dimension === 'string') return null;
  if (typeof dimension === 'object' && 'score' in dimension) {
    return dimension.score ?? null;
  }
  return null;
};

const getOverallScore = (interview: InterviewWithAnalysis): number | null => {
  if (!interview.analysis) return null;
  return getScore(interview.analysis.overall);
};

const AnalyticsPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingInterview, setDeletingInterview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sessionsRes, interviewsRes] = await Promise.all([
          sessionApi.getSessions(),
          vapiApi.getInterviews(),
        ]);

        if (sessionsRes.success && sessionsRes.data) {
          setSessions(sessionsRes.data);
        }

        if (interviewsRes.success && interviewsRes.data) {
          setInterviews(interviewsRes.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user]);

  const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED);
  const totalRoundsCompleted = sessions.reduce(
    (acc, s) => acc + s.rounds.filter((r) => r.status === InterviewStatus.COMPLETED).length,
    0,
  );

  const scoredInterviews = interviews.filter((i) => getOverallScore(i) !== null);
  const avgScore =
    scoredInterviews.length > 0
      ? scoredInterviews.reduce((acc, i) => acc + (getOverallScore(i) || 0), 0) /
        scoredInterviews.length
      : 0;

  const bestScore =
    scoredInterviews.length > 0
      ? Math.max(...scoredInterviews.map((i) => getOverallScore(i) || 0))
      : 0;

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to delete this interview record? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingInterview(interviewId);
      await vapiApi.deleteInterview(interviewId);
      setInterviews((prev) => prev.filter((i) => i.id !== interviewId));
    } catch (err) {
      console.error('Failed to delete interview:', err);
      alert('Failed to delete interview. Please try again.');
    } finally {
      setDeletingInterview(null);
    }
  };

  const handleViewInterview = (interviewId: string) => {
    router.push(`/dashboard/analytics/${interviewId}`);
  };

  const statCards = [
    {
      label: 'Sessions Completed',
      value: completedSessions.length.toString(),
      icon: <Layers size={20} />,
      color: 'bg-indigo-400',
      subtext: `${sessions.length} total`,
    },
    {
      label: 'Rounds Completed',
      value: totalRoundsCompleted.toString(),
      icon: <CheckCircle2 size={20} />,
      color: 'bg-green-400',
      subtext: 'Across all sessions',
    },
    {
      label: 'Average Score',
      value: avgScore > 0 ? `${avgScore.toFixed(0)}%` : 'N/A',
      icon: <TrendingUp size={20} />,
      color: 'bg-purple-400',
      subtext: 'Overall performance',
    },
    {
      label: 'Best Score',
      value: bestScore > 0 ? `${bestScore.toFixed(0)}%` : 'N/A',
      icon: <Award size={20} />,
      color: 'bg-yellow-400',
      subtext: 'Personal best',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-2 text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-400 hover:text-indigo-500"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasData = interviews.length > 0 || sessions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <header>
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-800">Analytics</h1>
        <p className="text-slate-500">Track your interview performance and progress</p>
      </header>

      {!hasData && (
        <section className="rounded-[2rem] border border-white bg-white/60 p-8 text-center backdrop-blur-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
            <BarChart2 size={36} className="text-indigo-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">No Analytics Yet</h2>
          <p className="mx-auto mb-6 max-w-md text-slate-500">
            Complete interview rounds to see your performance analytics here
          </p>
          <Link href="/dashboard/interviews">
            <button className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-indigo-500">
              Go to Interviews
              <ArrowRight size={18} />
            </button>
          </Link>
        </section>
      )}

      {hasData && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group rounded-2xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.color} rounded-xl text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.subtext}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Interview History */}
          {interviews.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Interview History</h3>
                <span className="text-sm text-slate-500">
                  {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-3">
                {interviews
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((interview, idx) => {
                    const score = getOverallScore(interview);
                    const duration = interview.durationSeconds
                      ? Math.floor(interview.durationSeconds / 60)
                      : null;

                    return (
                      <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group rounded-2xl border border-white bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-lg"
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div className="flex items-center gap-4">
                            <div
                              className={`rounded-xl p-3 text-white shadow-lg ${
                                interview.roundType ? 'bg-indigo-400' : 'bg-slate-400'
                              }`}
                            >
                              {interview.roundType ? (
                                ROUND_ICONS[interview.roundType as RoundType]
                              ) : (
                                <Target size={18} />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">
                                {interview.roundType
                                  ? ROUND_DISPLAY_INFO[interview.roundType as RoundType]?.title ||
                                    'Interview'
                                  : 'Mock Interview'}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(interview.startedAt)}
                                </span>
                                {duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {duration} min
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleDeleteInterview(interview.id)}
                              disabled={deletingInterview === interview.id}
                              className="rounded-full p-2 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                              title="Delete Interview"
                            >
                              {deletingInterview === interview.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                            {score !== null && (
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                                  score >= 80
                                    ? 'bg-green-100 text-green-600'
                                    : score >= 60
                                      ? 'bg-yellow-100 text-yellow-600'
                                      : 'bg-red-100 text-red-600'
                                }`}
                              >
                                <span className="text-lg font-bold">{score.toFixed(0)}</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleViewInterview(interview.id)}
                              className="flex items-center gap-2 rounded-full bg-indigo-400 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:shadow-lg"
                            >
                              <Eye size={16} />
                              Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Pagination */}
              {interviews.length > ITEMS_PER_PAGE && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from(
                    { length: Math.ceil(interviews.length / ITEMS_PER_PAGE) },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 w-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-indigo-400 text-white shadow-md'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(Math.ceil(interviews.length / ITEMS_PER_PAGE), p + 1),
                      )
                    }
                    disabled={currentPage === Math.ceil(interviews.length / ITEMS_PER_PAGE)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AnalyticsPage;
