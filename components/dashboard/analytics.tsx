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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapiApi } from "@/lib/api";
import { InterviewWithAnalysis, AnalysisDimension } from "@/lib/types";
import { useAuth } from "@/lib/hooks";

// Helper to format date
const formatMeetingDate = (dateString: string) => {
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

// Helper to format duration
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "N/A";
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

// Helper to get score from analysis dimension
const getScore = (
  dimension: AnalysisDimension | null | undefined
): number | null => {
  if (!dimension || typeof dimension === "string") return null;
  if (typeof dimension === "object" && "score" in dimension) {
    return dimension.score ?? null;
  }
  return null;
};

// Helper to get overall score
const getOverallScore = (interview: InterviewWithAnalysis): number | null => {
  if (!interview.analysis) return null;
  return getScore(interview.analysis.overall);
};

// Helper to get company name from context prompt (if available)
const getCompanyFromContext = (contextPrompt: string | null): string => {
  if (!contextPrompt) return "Interview";
  const match = contextPrompt.match(/Target Company:\s*([^\n]+)/i);
  return match ? match[1].trim() : "Interview";
};

// Helper to get role from context prompt (if available)
const getRoleFromContext = (contextPrompt: string | null): string => {
  if (!contextPrompt) return "Mock Interview";
  const match = contextPrompt.match(/Target Role:\s*([^\n]+)/i);
  return match ? match[1].trim() : "Mock Interview";
};

export const Analytics = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before making the request
    if (authLoading) return;

    // Don't fetch if user is not authenticated (AuthGuard will handle redirect)
    if (!user) return;

    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await vapiApi.getInterviews();
        if (response.success && response.data) {
          setInterviews(response.data);
        } else {
          setError(response.error || "Failed to load interviews");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load interviews"
        );
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
    return (
      acc +
      (interview.durationSeconds
        ? Math.floor(interview.durationSeconds / 60)
        : 0)
    );
  }, 0);

  const overallStats = [
    {
      label: "Total Interviews",
      value: totalInterviews.toString(),
      icon: <Target size={20} />,
      color: "bg-blue-400",
    },
    {
      label: "This Week",
      value: thisWeekInterviews.toString(),
      icon: <Calendar size={20} />,
      color: "bg-green-400",
    },
    {
      label: "Total Hours",
      value: `${(totalMinutes / 60).toFixed(1)}h`,
      icon: <Clock size={20} />,
      color: "bg-purple-400",
    },
  ];

  const handleViewMeeting = (interviewId: string) => {
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
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
          Analytics
        </h1>
        <p className="text-slate-500">
          Track your interview performance and progress
        </p>
      </header>

      {/* Overall Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overallStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 ${stat.color} rounded-xl text-white shadow-lg`}
              >
                {stat.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Meeting Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            Interview Sessions
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BarChart2 size={16} />
            <span>{interviews.length} total</span>
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white/60 backdrop-blur-md border border-white rounded-2xl p-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
              <BarChart2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              No Interviews Yet
            </h2>
            <p className="text-slate-500">
              Start your first mock interview to see analytics here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview, idx) => {
              const companyName = getCompanyFromContext(
                interview.contextPrompt
              );
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
                  className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Company + Role */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-indigo-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                        {companyName[0]?.toUpperCase() || "I"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 text-lg mb-1 truncate">
                          {role}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">
                          {companyName}
                        </p>
                        {overallScore !== null && (
                          <div className="flex items-center gap-2 mt-1">
                            <Award size={14} className="text-yellow-500" />
                            <span className="text-sm font-semibold text-slate-700">
                              Score: {overallScore.toFixed(1)}/100
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                        <Calendar size={14} />
                        <span>{formatMeetingDate(interview.startedAt)}</span>
                      </div>
                      {duration !== null && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                          <Clock size={14} />
                          <span>{duration} min</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewMeeting(interview.id)}
                      className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group/btn whitespace-nowrap cursor-pointer"
                    >
                      <Eye
                        size={16}
                        className="group-hover/btn:scale-110 transition-transform"
                      />
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
