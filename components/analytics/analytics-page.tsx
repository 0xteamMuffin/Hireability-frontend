"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { vapiApi, sessionApi } from "@/lib/api";
import { 
  InterviewWithAnalysis, 
  AnalysisDimension, 
  InterviewSession, 
  RoundType, 
  InterviewStatus,
  SessionStatus,
  ROUND_DISPLAY_INFO 
} from "@/lib/types";
import { useAuth } from "@/lib/hooks";

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

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
  const searchParams = useSearchParams();
  const filterSessionId = searchParams.get('sessionId');
  const { user, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user]);

  // Filter interviews if sessionId is provided
  const filteredInterviews = filterSessionId 
    ? interviews.filter(i => i.sessionId === filterSessionId)
    : interviews;

  // Calculate stats
  const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);
  const totalRoundsCompleted = sessions.reduce((acc, s) => 
    acc + s.rounds.filter(r => r.status === InterviewStatus.COMPLETED).length, 0
  );
  
  const scoredInterviews = filteredInterviews.filter(i => getOverallScore(i) !== null);
  const avgScore = scoredInterviews.length > 0 
    ? scoredInterviews.reduce((acc, i) => acc + (getOverallScore(i) || 0), 0) / scoredInterviews.length
    : 0;

  // Best score
  const bestScore = scoredInterviews.length > 0
    ? Math.max(...scoredInterviews.map(i => getOverallScore(i) || 0))
    : 0;

  // Round type breakdown
  const roundTypeStats = Object.values(RoundType).map(type => {
    const typeInterviews = filteredInterviews.filter(i => i.roundType === type);
    const typeScored = typeInterviews.filter(i => getOverallScore(i) !== null);
    const avgTypeScore = typeScored.length > 0
      ? typeScored.reduce((acc, i) => acc + (getOverallScore(i) || 0), 0) / typeScored.length
      : 0;
    return {
      type,
      total: typeInterviews.length,
      avgScore: avgTypeScore,
      info: ROUND_DISPLAY_INFO[type],
    };
  }).filter(s => s.total > 0);

  const statCards = [
    {
      label: "Sessions Completed",
      value: completedSessions.length.toString(),
      icon: <Layers size={20} />,
      color: "bg-indigo-400",
      subtext: `${sessions.length} total`,
    },
    {
      label: "Rounds Completed",
      value: totalRoundsCompleted.toString(),
      icon: <CheckCircle2 size={20} />,
      color: "bg-green-400",
      subtext: "Across all sessions",
    },
    {
      label: "Average Score",
      value: avgScore > 0 ? `${avgScore.toFixed(0)}%` : "N/A",
      icon: <TrendingUp size={20} />,
      color: "bg-purple-400",
      subtext: "Overall performance",
    },
    {
      label: "Best Score",
      value: bestScore > 0 ? `${bestScore.toFixed(0)}%` : "N/A",
      icon: <Award size={20} />,
      color: "bg-yellow-400",
      subtext: "Personal best",
    },
  ];

  const handleViewInterview = (interviewId: string) => {
    router.push(`/dashboard/analytics/${interviewId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="text-red-500 mb-2">{error}</div>
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
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
            Analytics
          </h1>
          <p className="text-slate-500">
            {filterSessionId 
              ? "Viewing analytics for selected session"
              : "Track your interview performance and progress"
            }
          </p>
        </div>
        {filterSessionId && (
          <button
            onClick={() => router.push('/dashboard/analytics')}
            className="text-indigo-400 hover:text-indigo-500 font-medium text-sm"
          >
            View All Analytics
          </button>
        )}
      </header>

      {/* No Data State */}
      {filteredInterviews.length === 0 && (
        <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart2 size={36} className="text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Analytics Yet</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Complete interview rounds to see your performance analytics here
          </p>
          <Link href="/dashboard/interviews">
            <button className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold shadow-md transition-all inline-flex items-center gap-2">
              Go to Interviews
              <ArrowRight size={18} />
            </button>
          </Link>
        </section>
      )}

      {/* Stats Grid */}
      {filteredInterviews.length > 0 && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.color} rounded-xl text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.subtext}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Interview Results */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Interview Results</h3>
              <span className="text-sm text-slate-500">
                {filteredInterviews.length} total
              </span>
            </div>
            <div className="space-y-3">
              {filteredInterviews
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((interview, idx) => {
                const score = getOverallScore(interview);
                const duration = interview.durationSeconds ? Math.floor(interview.durationSeconds / 60) : null;
                
                return (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl text-white shadow-lg ${
                          interview.roundType ? 'bg-indigo-400' : 'bg-slate-400'
                        }`}>
                          {interview.roundType ? ROUND_ICONS[interview.roundType as RoundType] : <Target size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {interview.roundType 
                              ? ROUND_DISPLAY_INFO[interview.roundType as RoundType]?.title || 'Interview'
                              : 'Mock Interview'
                            }
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
                        {score !== null && (
                          <div className="flex items-center gap-2">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              score >= 80 ? 'bg-green-100 text-green-600' :
                              score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              <span className="text-xl font-bold">{score.toFixed(0)}</span>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => handleViewInterview(interview.id)}
                          className="bg-indigo-400 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
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
            {filteredInterviews.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-indigo-400 text-white shadow-md'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </motion.div>
  );
};

export default AnalyticsPage;