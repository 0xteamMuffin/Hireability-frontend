"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { vapiApi, sessionApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { InterviewSession, RoundType, InterviewStatus, SessionStatus, ROUND_DISPLAY_INFO } from "@/lib/types";

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
    avgScore: "0%",
    hoursPracticed: "0h",
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
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Get recent sessions
  const recentSessions = sessions.slice(0, 3);
  const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);

  const statCards = [
    {
      label: "Total Sessions",
      value: sessions.length.toString(),
      icon: <Layers size={20} />,
      change: `${completedSessions.length} completed`,
    },
    {
      label: "Avg. Score",
      value: stats.avgScore,
      icon: <TrendingUp size={20} />,
      change: "Overall performance",
    },
    {
      label: "Hours Practiced",
      value: stats.hoursPracticed,
      icon: <Clock size={20} />,
      change: "Time invested",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.COMPLETED:
        return "bg-green-100 text-green-700 border-green-200";
      case SessionStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case SessionStatus.ABANDONED:
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
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
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.firstName || "User"}! Ready to ace your next
            interview?
          </p>
        </div>
        <div className="md:hidden">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <User size={20} className="text-slate-600" />
          </div>
        </div>
      </header>

      {/* Start New Session */}
        <section className="relative overflow-hidden rounded-[2rem] bg-indigo-400 text-white shadow-xl shadow-indigo-200 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              System Ready
            </div>
            <h2 className="text-3xl font-bold mb-2">Start New Interview</h2>
            <p className="text-indigo-100 mb-0">
              Begin a new mock interview session to practice your skills and get
              real-time feedback.
            </p>
          </div>
          <Link href="/config">
            <button className="relative z-10 bg-white text-indigo-500 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-slate-50 hover:scale-105 transition-all flex items-center gap-2 group whitespace-nowrap cursor-pointer">
              Start Session
              <Play
                size={20}
                className="fill-indigo-500 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Link>
        </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400 group-hover:bg-indigo-400 group-hover:text-white transition-colors">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/interviews" className="block">
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Play size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Interviews</h3>
                  <p className="text-sm text-slate-500">Manage & continue sessions</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-purple-500 transition-colors" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/analytics" className="block">
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Analytics</h3>
                  <p className="text-sm text-slate-500">View scores & performance</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/target" className="block">
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Target Roles</h3>
                  <p className="text-sm text-slate-500">Configure job roles to practice</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/resume" className="block">
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Resume Review</h3>
                  <p className="text-sm text-slate-500">Get AI feedback on your resume</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        </Link>
      </section>

      {/* Recent Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Recent Sessions</h3>
          <Link
            href="/dashboard/interviews"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
          >
            View All
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-indigo-300" />
              </div>
              <p className="text-slate-600 font-medium mb-2">No sessions yet</p>
              <p className="text-slate-400 text-sm">Start your first interview to begin practicing!</p>
            </div>
          ) : (
            recentSessions.map((session, idx) => {
              const completedRounds = session.rounds.filter(
                (r) => r.status === InterviewStatus.COMPLETED
              ).length;
              const progress = (completedRounds / session.totalRounds) * 100;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href="/dashboard/interviews"
                    className="block"
                  >
                    <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                            session.status === SessionStatus.COMPLETED 
                              ? 'bg-green-400' 
                              : session.status === SessionStatus.ABANDONED
                              ? 'bg-slate-400'
                              : 'bg-indigo-400'
                          }`}>
                            <Layers size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">
                              Interview Session
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <Calendar size={12} /> {formatDate(session.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Round Pills */}
                          <div className="hidden md:flex items-center gap-1">
                            {session.rounds.slice(0, 3).map((round) => (
                              <div
                                key={round.id}
                                className={`p-1.5 rounded-lg ${
                                  round.status === InterviewStatus.COMPLETED
                                    ? "bg-green-100 text-green-600"
                                    : "bg-slate-100 text-slate-400"
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
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-400 rounded-full"
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
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {session.status === SessionStatus.COMPLETED
                              ? "Completed"
                              : session.status === SessionStatus.IN_PROGRESS
                              ? "In Progress"
                              : "Abandoned"}
                          </div>

                          <ChevronRight
                            size={20}
                            className="text-slate-300 group-hover:text-indigo-400 transition-colors"
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
