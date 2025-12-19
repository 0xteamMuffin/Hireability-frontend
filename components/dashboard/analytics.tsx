'use client';

import { motion } from 'framer-motion';
import { BarChart2, Clock, Calendar, TrendingUp, Award, Target, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { vapiApi } from '@/lib/api';
import { InterviewWithAnalysis, AnalysisDimension } from '@/lib/types';
import { useAuth } from '@/lib/hooks';

const formatMeetingDate = (dateString: string) => {
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

const formatDuration = (seconds: number | null) => {
  if (!seconds) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
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

const getCompanyFromContext = (contextPrompt: string | null): string => {
  if (!contextPrompt) return 'Interview';
  const match = contextPrompt.match(/Target Company:\s*([^\n]+)/i);
  return match ? match[1].trim() : 'Interview';
};

const getRoleFromContext = (contextPrompt: string | null): string => {
  if (!contextPrompt) return 'Mock Interview';
  const match = contextPrompt.match(/Target Role:\s*([^\n]+)/i);
  return match ? match[1].trim() : 'Mock Interview';
};

export const Analytics = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) return;

    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await vapiApi.getInterviews();
        if (response.success && response.data) {
          setInterviews(response.data);
        } else {
          setError(response.error || 'Failed to load interviews');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [authLoading, user]);

  const totalInterviews = interviews.length;
  const thisWeekInterviews = interviews.filter((interview) => {
    const interviewDate = new Date(interview.startedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return interviewDate >= weekAgo;
  }).length;

  const totalMinutes = interviews.reduce((acc, interview) => {
    return acc + (interview.durationSeconds ? Math.floor(interview.durationSeconds / 60) : 0);
  }, 0);

  const overallStats = [
    {
      label: 'Total Interviews',
      value: totalInterviews.toString(),
      icon: <Target size={20} />,
      color: 'bg-blue-400',
    },
    {
      label: 'This Week',
      value: thisWeekInterviews.toString(),
      icon: <Calendar size={20} />,
      color: 'bg-green-400',
    },
    {
      label: 'Total Hours',
      value: `${(totalMinutes / 60).toFixed(1)}h`,
      icon: <Clock size={20} />,
      color: 'bg-purple-400',
    },
  ];

  const handleViewMeeting = (interviewId: string) => {
    router.push(`/dashboard/analytics/${interviewId}`);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <header>
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-800">Analytics</h1>
        <p className="text-slate-500">Track your interview performance and progress</p>
      </header>

      {/* Overall Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overallStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group rounded-2xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.color} rounded-xl text-white shadow-lg`}>{stat.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Meeting Cards */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Interview Sessions</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BarChart2 size={16} />
            <span>{interviews.length} total</span>
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center rounded-2xl border border-white bg-white/60 p-8 text-center backdrop-blur-md">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-300">
              <BarChart2 size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">No Interviews Yet</h2>
            <p className="text-slate-500">Start your first mock interview to see analytics here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview, idx) => {
              const companyName = getCompanyFromContext(interview.contextPrompt);
              const role = getRoleFromContext(interview.contextPrompt);
              const overallScore = getOverallScore(interview);
              const duration = interview.durationSeconds
                ? Math.floor(interview.durationSeconds / 60)
                : null;

              return (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group rounded-2xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    {/* Left: Company + Role */}
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-400 text-2xl font-bold text-white shadow-lg">
                        {companyName[0]?.toUpperCase() || 'I'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 truncate text-lg font-bold text-slate-800">{role}</h4>
                        <p className="text-sm font-medium text-slate-500">{companyName}</p>
                        {overallScore !== null && (
                          <div className="mt-1 flex items-center gap-2">
                            <Award size={14} className="text-yellow-500" />
                            <span className="text-sm font-semibold text-slate-700">
                              Score: {overallScore.toFixed(1)}/100
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <Calendar size={14} />
                        <span>{formatMeetingDate(interview.startedAt)}</span>
                      </div>
                      {duration !== null && (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          <Clock size={14} />
                          <span>{duration} min</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewMeeting(interview.id)}
                      className="group/btn flex cursor-pointer items-center gap-2 rounded-full bg-indigo-400 px-6 py-2.5 font-semibold whitespace-nowrap text-white shadow-md transition-all hover:bg-indigo-500 hover:shadow-lg"
                    >
                      <Eye size={16} className="transition-transform group-hover/btn:scale-110" />
                      View
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
};
