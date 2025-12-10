"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Code,
  Lightbulb,
  MessageSquare,
  Briefcase,
  User,
  Star,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapiApi } from "@/lib/api";
import { InterviewWithAnalysis, AnalysisDimension } from "@/lib/types";
import { useAuth } from "@/lib/hooks";

interface DimensionCardProps {
  title: string;
  icon: React.ReactNode;
  dimension: AnalysisDimension | null | undefined;
  weight: string;
  color: string;
}

const DimensionCard: React.FC<DimensionCardProps> = ({
  title,
  icon,
  dimension,
  weight,
  color,
}) => {
  const score =
    dimension && typeof dimension === "object" && "score" in dimension
      ? dimension.score
      : null;
  const notes =
    dimension && typeof dimension === "object" && "notes" in dimension
      ? dimension.notes
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${color} rounded-lg text-white`}>{icon}</div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            <p className="text-xs text-slate-500">{weight} weight</p>
          </div>
        </div>
        {score !== null && (
          <div className="flex items-center gap-2">
            <Award className="text-yellow-500" size={20} />
            <span className="text-2xl font-bold text-slate-800">
              {score.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">/10</span>
          </div>
        )}
      </div>
      {notes && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 leading-relaxed">{notes}</p>
        </div>
      )}
      {score === null && !notes && (
        <p className="text-sm text-slate-400 italic">
          No analysis available yet
        </p>
      )}
    </motion.div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "N/A";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const getCompanyFromContext = (contextPrompt: string | null): string => {
  if (!contextPrompt) return "Interview";
  const match = contextPrompt.match(/Target Company:\s*([^\n]+)/i);
  return match ? match[1].trim() : "Interview";
};

const getRoleFromContext = (contextPrompt: string | null): string => {
  if (!contextPrompt) return "Mock Interview";
  const match = contextPrompt.match(/Target Role:\s*([^\n]+)/i);
  return match ? match[1].trim() : "Mock Interview";
};

export const InterviewDetail: React.FC<{ interviewId: string }> = ({
  interviewId,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [interview, setInterview] = useState<InterviewWithAnalysis | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AuthGuard handles redirect, but we still check here for safety
    if (!user) return;

    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await vapiApi.getInterviewById(interviewId);
        if (response.success && response.data) {
          setInterview(response.data);
        } else {
          setError(response.error || "Failed to load interview");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load interview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [user, interviewId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="text-red-500 mb-2">
          {error || "Interview not found"}
        </div>
        <button
          onClick={() => router.back()}
          className="text-indigo-400 hover:text-indigo-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  const companyName = getCompanyFromContext(interview.contextPrompt);
  const role = getRoleFromContext(interview.contextPrompt);
  const overallScore =
    interview.analysis?.overall &&
    typeof interview.analysis.overall === "object" &&
    "score" in interview.analysis.overall
      ? interview.analysis.overall.score
      : null;

  const dimensions = [
    {
      title: "Problem-Solving Skills",
      icon: <Lightbulb size={20} />,
      dimension: interview.analysis?.problemSolving,
      weight: "20%",
      color: "bg-blue-400",
    },
    {
      title: "Technical Competency",
      icon: <Code size={20} />,
      dimension: interview.analysis?.technical,
      weight: "20%",
      color: "bg-purple-400",
    },
    {
      title: "Role-Specific Knowledge",
      icon: <Briefcase size={20} />,
      dimension: interview.analysis?.roleKnowledge,
      weight: "20%",
      color: "bg-green-400",
    },
    {
      title: "Experience",
      icon: <TrendingUp size={20} />,
      dimension: interview.analysis?.experience,
      weight: "15%",
      color: "bg-orange-400",
    },
    {
      title: "Communication",
      icon: <MessageSquare size={20} />,
      dimension: interview.analysis?.communication,
      weight: "15%",
      color: "bg-pink-400",
    },
    {
      title: "Professional Demeanor",
      icon: <User size={20} />,
      dimension: interview.analysis?.professional,
      weight: "10%",
      color: "bg-indigo-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/60 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
            Interview Details
          </h1>
          <p className="text-slate-500">
            {role} at {companyName}
          </p>
        </div>
      </div>

      {/* Overall Score Card */}
      {overallScore !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl p-8 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Overall Performance
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {overallScore.toFixed(1)}
                </span>
                <span className="text-2xl opacity-90">/10</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star size={48} className="text-yellow-300" fill="currentColor" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Interview Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-indigo-400" size={20} />
            <div>
              <p className="text-xs text-slate-500">Date</p>
              <p className="font-semibold text-slate-800">
                {formatDate(interview.startedAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-indigo-400" size={20} />
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="font-semibold text-slate-800">
                {formatDuration(interview.durationSeconds)}
              </p>
            </div>
          </div>
        </div>
        {interview.analysis?.modelVersion && (
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Award className="text-indigo-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Model</p>
                <p className="font-semibold text-slate-800">
                  {interview.analysis.modelVersion}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Dimensions */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Performance Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dimensions.map((dim, idx) => (
            <DimensionCard key={idx} {...dim} />
          ))}
        </div>
      </section>

      {/* Transcript Preview */}
      {interview.transcripts && interview.transcripts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Transcript</h2>
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 max-h-96 overflow-y-auto">
            {interview.transcripts[0].transcript &&
            Array.isArray(interview.transcripts[0].transcript) ? (
              <div className="space-y-4">
                {(
                  interview.transcripts[0].transcript as Array<{
                    role: string;
                    text: string;
                    timestamp?: string;
                  }>
                ).map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      entry.role === "user"
                        ? "bg-indigo-50 ml-8"
                        : "bg-slate-50 mr-8"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-600 capitalize">
                        {entry.role === "user" ? "You" : "Interviewer"}
                      </span>
                      {entry.timestamp && (
                        <span className="text-xs text-slate-400">
                          {entry.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700">{entry.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Transcript not available</p>
            )}
          </div>
        </section>
      )}
    </motion.div>
  );
};
