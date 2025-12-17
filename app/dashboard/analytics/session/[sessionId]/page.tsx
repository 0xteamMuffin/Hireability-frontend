"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  Users,
  Cpu,
  Code,
  Network,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  Eye,
  Award,
} from "lucide-react";
import { sessionApi, vapiApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import {
  InterviewSession,
  InterviewRound,
  RoundType,
  InterviewStatus,
  SessionStatus,
  ROUND_DISPLAY_INFO,
  InterviewWithAnalysis,
  AnalysisDimension,
} from "@/lib/types";

const ROUND_ICONS: Record<RoundType, React.ReactNode> = {
  [RoundType.BEHAVIORAL]: <Users size={20} />,
  [RoundType.TECHNICAL]: <Cpu size={20} />,
  [RoundType.CODING]: <Code size={20} />,
  [RoundType.SYSTEM_DESIGN]: <Network size={20} />,
  [RoundType.HR]: <Briefcase size={20} />,
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getStatusColor = (status: InterviewStatus | SessionStatus) => {
  switch (status) {
    case InterviewStatus.COMPLETED:
    case SessionStatus.COMPLETED:
      return "bg-green-400";
    case InterviewStatus.IN_PROGRESS:
    case SessionStatus.IN_PROGRESS:
      return "bg-blue-400";
    case InterviewStatus.SKIPPED:
      return "bg-yellow-400";
    case SessionStatus.ABANDONED:
      return "bg-red-400";
    default:
      return "bg-slate-400";
  }
};

const getStatusLabel = (status: InterviewStatus | SessionStatus) => {
  switch (status) {
    case InterviewStatus.COMPLETED:
    case SessionStatus.COMPLETED:
      return "Completed";
    case InterviewStatus.IN_PROGRESS:
    case SessionStatus.IN_PROGRESS:
      return "In Progress";
    case InterviewStatus.SKIPPED:
      return "Skipped";
    case SessionStatus.ABANDONED:
      return "Abandoned";
    default:
      return "Not Started";
  }
};

const getStatusIcon = (status: InterviewStatus) => {
  switch (status) {
    case InterviewStatus.COMPLETED:
      return <CheckCircle2 size={20} className="text-green-500" />;
    case InterviewStatus.IN_PROGRESS:
      return <Loader2 size={20} className="text-blue-500 animate-spin" />;
    case InterviewStatus.SKIPPED:
      return <XCircle size={20} className="text-yellow-500" />;
    default:
      return <AlertCircle size={20} className="text-slate-400" />;
  }
};

const getScore = (dimension: AnalysisDimension | null | undefined): number | null => {
  if (!dimension || typeof dimension === 'string') return null;
  if (typeof dimension === 'object' && 'score' in dimension) {
    return dimension.score ?? null;
  }
  return null;
};

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { user, isLoading: authLoading } = useAuth();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user || !sessionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [sessionRes, interviewsRes] = await Promise.all([
          sessionApi.getSession(sessionId),
          vapiApi.getInterviews(),
        ]);

        if (sessionRes.success && sessionRes.data) {
          setSession(sessionRes.data);
        } else {
          setError("Session not found");
        }

        if (interviewsRes.success && interviewsRes.data) {
          // Filter interviews belonging to this session
          const sessionInterviews = interviewsRes.data.filter(
            (i) => i.sessionId === sessionId
          );
          setInterviews(sessionInterviews);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, sessionId]);

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

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <div className="text-red-500 mb-4">{error || "Session not found"}</div>
        <button
          onClick={() => router.push("/dashboard/analytics")}
          className="text-indigo-400 hover:text-indigo-500 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Analytics
        </button>
      </div>
    );
  }

  const completedRounds = session.rounds.filter(
    (r) => r.status === InterviewStatus.COMPLETED
  ).length;
  const progress = (completedRounds / session.totalRounds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/analytics")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Analytics</span>
      </button>

      {/* Header */}
      <div className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Layers size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Interview Session
              </h1>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(
                    session.status
                  )}`}
                >
                  {getStatusLabel(session.status)}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(session.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500 mb-1">Progress</p>
            <p className="text-2xl font-bold text-slate-800 mb-2">
              {completedRounds} / {session.totalRounds} rounds
            </p>
            <div className="w-48 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rounds Grid */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Interview Rounds
        </h2>
        <div className="grid gap-4">
          {session.rounds.map((round, idx) => {
            const info = ROUND_DISPLAY_INFO[round.roundType];
            const interview = interviews.find(
              (i) => i.roundType === round.roundType
            );
            const score = interview?.analysis
              ? getScore(interview.analysis.overall)
              : null;

            return (
              <motion.div
                key={round.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white/60 backdrop-blur-md border rounded-2xl p-6 shadow-sm transition-all ${
                  round.status === InterviewStatus.COMPLETED
                    ? "border-green-200"
                    : round.status === InterviewStatus.IN_PROGRESS
                    ? "border-blue-200"
                    : "border-white"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-xl ${
                        round.status === InterviewStatus.COMPLETED
                          ? "bg-green-100 text-green-600"
                          : round.status === InterviewStatus.IN_PROGRESS
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {ROUND_ICONS[round.roundType]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 text-lg">
                          {info.title}
                        </h3>
                        {getStatusIcon(round.status)}
                      </div>
                      <p className="text-sm text-slate-500">{info.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <Clock size={12} />
                        ~{info.estimatedDuration} min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {score !== null && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                        <Award size={18} className="text-yellow-500" />
                        <span className="font-bold text-slate-700">
                          {score.toFixed(0)}/100
                        </span>
                      </div>
                    )}

                    {round.status === InterviewStatus.COMPLETED && interview && (
                      <button
                        onClick={() => handleViewInterview(interview.id)}
                        className="bg-indigo-400 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    )}

                    {round.status === InterviewStatus.NOT_STARTED && (
                      <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-sm">
                        Not Started
                      </span>
                    )}

                    {round.status === InterviewStatus.SKIPPED && (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-full text-sm">
                        Skipped
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Session Summary */}
      {session.status === SessionStatus.COMPLETED && (
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-[2rem] p-8">
          <div className="flex items-center gap-4 mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
            <h2 className="text-2xl font-bold text-slate-800">
              Session Complete!
            </h2>
          </div>
          <p className="text-slate-600 mb-6">
            Great job! You completed all {session.totalRounds} interview rounds
            in this session.
          </p>
          {interviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviews.map((interview) => {
                const score = interview.analysis
                  ? getScore(interview.analysis.overall)
                  : null;
                return score !== null ? (
                  <div
                    key={interview.id}
                    className="bg-white/80 rounded-xl p-4 text-center"
                  >
                    <p className="text-sm text-slate-500 mb-1">
                      {interview.roundType
                        ? ROUND_DISPLAY_INFO[interview.roundType as RoundType]?.title
                        : "Interview"}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {score.toFixed(0)}%
                    </p>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
}
