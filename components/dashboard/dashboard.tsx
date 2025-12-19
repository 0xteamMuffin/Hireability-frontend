'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  TrendingUp,
  Play,
  Calendar,
  CheckCircle2,
  User,
  Loader2,
  Layers,
  Users,
  Cpu,
  Code,
  Network,
  Briefcase,
  ChevronRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { vapiApi, sessionApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks';
import {
  InterviewSession,
  RoundType,
  InterviewStatus,
  SessionStatus,
  ROUND_DISPLAY_INFO,
} from '@/lib/types';

const ROUND_ICONS: Record<RoundType, React.ReactNode> = {
  [RoundType.BEHAVIORAL]: <Users size={14} />,
  [RoundType.TECHNICAL]: <Cpu size={14} />,
  [RoundType.CODING]: <Code size={14} />,
  [RoundType.SYSTEM_DESIGN]: <Network size={14} />,
  [RoundType.HR]: <Briefcase size={14} />,
};

export const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: '0%',
    hoursPracticed: '0h',
  });
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          vapiApi.getStats(),
          sessionApi.getSessions(),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (sessionsRes.success && sessionsRes.data) {
          setSessions(sessionsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const recentSessions = sessions.slice(0, 3);
  const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED);

  const statCards = [
    {
      label: 'Total Sessions',
      value: sessions.length.toString(),
      icon: <Layers size={20} />,
      change: `${completedSessions.length} completed`,
    },
    {
      label: 'Avg. Score',
      value: stats.avgScore,
      icon: <TrendingUp size={20} />,
      change: 'Overall performance',
    },
    {
      label: 'Hours Practiced',
      value: stats.hoursPracticed,
      icon: <Clock size={20} />,
      change: 'Time invested',
    },
  ];

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
    });
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.COMPLETED:
        return 'bg-green-100 text-green-700 border-green-200';
      case SessionStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case SessionStatus.ABANDONED:
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={40} />
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
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Welcome back, {user?.firstName || 'User'}! Ready to ace your next interview?
          </p>
        </div>
        <div className="md:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <User size={20} className="text-slate-600" />
          </div>
        </div>
      </header>

      {/* Start New Session */}
      <section className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[2rem] bg-indigo-400 p-8 text-white shadow-xl shadow-indigo-200 md:flex-row md:p-10">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-10 blur-3xl"></div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
            System Ready
          </div>
          <h2 className="mb-2 text-3xl font-bold">Start New Interview</h2>
          <p className="mb-0 text-indigo-100">
            Begin a new mock interview session to practice your skills and get real-time feedback.
          </p>
        </div>
        <Link href="/config">
          <button className="group relative z-10 flex cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-4 font-bold whitespace-nowrap text-indigo-500 shadow-lg transition-all hover:scale-105 hover:bg-slate-50">
            Start Session
            <Play
              size={20}
              className="fill-indigo-500 transition-transform group-hover:translate-x-1"
            />
          </button>
        </Link>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group rounded-2xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-400 transition-colors group-hover:bg-indigo-400 group-hover:text-white">
                {stat.icon}
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/dashboard/interviews" className="block">
          <div className="group cursor-pointer rounded-2xl border border-white bg-white/60 p-6 backdrop-blur-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-500 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <Play size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Interviews</h3>
                  <p className="text-sm text-slate-500">Manage & continue sessions</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 transition-colors group-hover:text-purple-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/analytics" className="block">
          <div className="group cursor-pointer rounded-2xl border border-white bg-white/60 p-6 backdrop-blur-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Analytics</h3>
                  <p className="text-sm text-slate-500">View scores & performance</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 transition-colors group-hover:text-blue-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/target" className="block">
          <div className="group cursor-pointer rounded-2xl border border-white bg-white/60 p-6 backdrop-blur-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Target Roles</h3>
                  <p className="text-sm text-slate-500">Configure job roles to practice</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 transition-colors group-hover:text-emerald-500" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/resume" className="block">
          <div className="group cursor-pointer rounded-2xl border border-white bg-white/60 p-6 backdrop-blur-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-orange-100 p-3 text-orange-500 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Resume Review</h3>
                  <p className="text-sm text-slate-500">Get AI feedback on your resume</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 transition-colors group-hover:text-orange-500" />
            </div>
          </div>
        </Link>
      </section>

      {/* Recent Sessions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Recent Sessions</h3>
          <Link
            href="/dashboard/interviews"
            className="flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-500"
          >
            View All
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <div className="rounded-[2rem] border border-white bg-white/60 p-8 text-center backdrop-blur-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <Sparkles size={28} className="text-indigo-300" />
              </div>
              <p className="mb-2 font-medium text-slate-600">No sessions yet</p>
              <p className="text-sm text-slate-400">
                Start your first interview to begin practicing!
              </p>
            </div>
          ) : (
            recentSessions.map((session, idx) => {
              const completedRounds = session.rounds.filter(
                (r) => r.status === InterviewStatus.COMPLETED,
              ).length;
              const progress = (completedRounds / session.totalRounds) * 100;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href="/dashboard/interviews" className="block">
                    <div className="group cursor-pointer rounded-2xl border border-white bg-white/60 p-5 backdrop-blur-md transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg ${
                              session.status === SessionStatus.COMPLETED
                                ? 'bg-green-400'
                                : session.status === SessionStatus.ABANDONED
                                  ? 'bg-slate-400'
                                  : 'bg-indigo-400'
                            }`}
                          >
                            <Layers size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">Interview Session</h4>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                              <Calendar size={12} /> {formatDate(session.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Round Pills */}
                          <div className="hidden items-center gap-1 md:flex">
                            {session.rounds.slice(0, 3).map((round) => (
                              <div
                                key={round.id}
                                className={`rounded-lg p-1.5 ${
                                  round.status === InterviewStatus.COMPLETED
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                                title={ROUND_DISPLAY_INFO[round.roundType].title}
                              >
                                {ROUND_ICONS[round.roundType]}
                              </div>
                            ))}
                            {session.rounds.length > 3 && (
                              <span className="text-xs text-slate-400">
                                +{session.rounds.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Progress */}
                          <div className="text-right">
                            <span className="text-xs text-slate-400">Progress</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-green-400"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-600">
                                {completedRounds}/{session.totalRounds}
                              </span>
                            </div>
                          </div>

                          {/* Status */}
                          <div
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                              session.status,
                            )}`}
                          >
                            {session.status === SessionStatus.COMPLETED
                              ? 'Completed'
                              : session.status === SessionStatus.IN_PROGRESS
                                ? 'In Progress'
                                : 'Abandoned'}
                          </div>

                          <ChevronRight
                            size={20}
                            className="text-slate-300 transition-colors group-hover:text-indigo-400"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </motion.div>
  );
};
