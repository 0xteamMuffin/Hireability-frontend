"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  Info,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapiApi } from "@/lib/api";
import { InterviewWithAnalysis, AnalysisDimension } from "@/lib/types";
import { useAuth } from "@/lib/hooks";

// --- COMPONENTS ---

interface DimensionCardProps {
  title: string;
  icon: React.ReactNode;
  dimension: AnalysisDimension | null | undefined;
  weight: string;
  styleConfig: {
    bg: string;
    text: string;
    border: string;
    iconBg: string;
    progressColor: string;
  };
  calculationLogic: string;
}

const CircularProgress: React.FC<{
  score: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}> = ({ score, size = 80, strokeWidth = 6, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track: Subtle Slate */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0" // slate-200
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-800 leading-none">
          {score.toFixed(0)}
        </span>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
};

const HorizontalBar: React.FC<{
  score: number;
  color: string;
  label: string;
}> = ({ score, color, label }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{score}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
  type: "strength" | "weakness" | "suggestion";
}> = ({ title, icon, items, type }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  // Matching Dashboard Colors (Soft Pastels)
  const styles = {
    strength: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      iconColor: "text-emerald-600",
      bullet: "bg-emerald-500",
    },
    weakness: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
      iconColor: "text-red-600",
      bullet: "bg-red-500",
    },
    suggestion: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-700",
      iconColor: "text-blue-600",
      bullet: "bg-blue-500",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden transition-all duration-300`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={style.iconColor}>{icon}</span>
          <span className={`font-semibold text-sm ${style.text}`}>{title}</span>
          <span className="text-[10px] font-bold bg-white/60 px-2 py-0.5 rounded-full text-slate-600 shadow-sm border border-black/5">
            {items.length}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className={style.iconColor} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="px-4 pb-4 space-y-2.5">
              {items.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
                >
                  <span
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.bullet}`}
                  />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DimensionCard: React.FC<DimensionCardProps> = ({
  title,
  icon,
  dimension,
  weight,
  styleConfig,
  calculationLogic,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const score = dimension?.score ?? null;
  const summary = dimension?.summary || dimension?.notes;
  const strengths = (dimension?.strengths as string[]) || [];
  const weaknesses = (dimension?.weaknesses as string[]) || [];
  const improvements = (dimension?.improvements as string[]) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // Clean White Card with soft border
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${styleConfig.iconBg} ${styleConfig.text} shadow-sm border ${styleConfig.border}`}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 relative">
              <h3 className="font-bold text-slate-800 text-lg">{title}</h3>

              {/* Tooltip */}
              <div
                className="relative cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info
                  size={16}
                  className="text-slate-400 hover:text-indigo-500 transition-colors"
                />
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none"
                    >
                      <div className="relative z-10 font-medium leading-relaxed text-center">
                        {calculationLogic}
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-slate-800 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-500 bg-slate-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-slate-200">
              Weight: {weight}
            </p>
          </div>
        </div>
        {score !== null && (
          <CircularProgress
            score={score}
            size={64}
            strokeWidth={5}
            color={styleConfig.progressColor}
          />
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5 text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          {summary}
        </div>
      )}

      {/* Accordions */}
      <div className="space-y-3">
        <CollapsibleSection
          title="Strengths"
          icon={<CheckCircle2 size={16} />}
          items={strengths}
          type="strength"
        />
        <CollapsibleSection
          title="Improvements"
          icon={<AlertTriangle size={16} />}
          items={weaknesses}
          type="weakness"
        />
        <CollapsibleSection
          title="Suggestions"
          icon={<Zap size={16} />}
          items={improvements}
          type="suggestion"
        />
      </div>

      {score === null && !summary && (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <Clock size={32} className="mb-2 opacity-50" />
          <p className="text-sm">Analysis pending...</p>
        </div>
      )}
    </motion.div>
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [analyzing, setAnalyzing] = useState(false);

  const handleRetryAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await vapiApi.analyzeInterview(interviewId);
      if (response.success) {
        const refresh = await vapiApi.getInterviewById(interviewId);
        if (refresh.data) setInterview(refresh.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await vapiApi.getInterviewById(interviewId);
        if (response.success && response.data) setInterview(response.data);
        else setError(response.error || "Failed to load");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [user, interviewId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  if (error || !interview)
    return (
      <div className="text-center p-10 text-red-500">
        {error || "Not found"}
      </div>
    );

  const contextPrompt = interview.contextPrompt || "";
  const companyName =
    contextPrompt.match(/Target Company:\s*([^\n]+)/i)?.[1].trim() ||
    "Target Company";
  const role =
    contextPrompt.match(/Target Role:\s*([^\n]+)/i)?.[1].trim() || "Role";
  const overallScore = interview.analysis?.overall?.score ?? null;

  // --- Theme Configuration using Tailwind classes (Matching Dashboard) ---
  const dimensions = [
    {
      title: "Problem Solving",
      icon: <Lightbulb size={20} />,
      dimension: interview.analysis?.problemSolving,
      weight: "20%",
      styleConfig: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
        iconBg: "bg-blue-50",
        progressColor: "#3b82f6", // blue-500
      },
      calculationLogic:
        "Evaluated based on the user's responses to problem scenarios provided.",
    },
    {
      title: "Technical Skills",
      icon: <Code size={20} />,
      dimension: interview.analysis?.technical,
      weight: "20%",
      styleConfig: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-100",
        iconBg: "bg-purple-50",
        progressColor: "#a855f7", // purple-500
      },
      calculationLogic:
        "Evaluated based on the accuracy and depth of technical responses given by the user.",
    },
    {
      title: "Role Knowledge",
      icon: <Briefcase size={20} />,
      dimension: interview.analysis?.roleKnowledge,
      weight: "20%",
      styleConfig: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        iconBg: "bg-emerald-50",
        progressColor: "#10b981", // emerald-500
      },
      calculationLogic:
        "Calculated by checking role knowledge against the specific context and job applied for.",
    },
    {
      title: "Experience",
      icon: <TrendingUp size={20} />,
      dimension: interview.analysis?.experience,
      weight: "15%",
      styleConfig: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-100",
        iconBg: "bg-orange-50",
        progressColor: "#f97316", // orange-500
      },
      calculationLogic:
        "Assessed by cross-referencing the resume details with experience mentioned during the talk.",
    },
    {
      title: "Communication",
      icon: <MessageSquare size={20} />,
      dimension: interview.analysis?.communication,
      weight: "15%",
      styleConfig: {
        bg: "bg-pink-50",
        text: "text-pink-600",
        border: "border-pink-100",
        iconBg: "bg-pink-50",
        progressColor: "#ec4899", // pink-500
      },
      calculationLogic:
        "Analyzed through voice processing, clarity, and articulation evaluation.",
    },
    {
      title: "Professionalism",
      icon: <User size={20} />,
      dimension: interview.analysis?.professional,
      weight: "10%",
      styleConfig: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-100",
        iconBg: "bg-indigo-50",
        progressColor: "#6366f1", // indigo-500
      },
      calculationLogic: "Determined by evaluating expression usage.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* Navbar / Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleRetryAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {analyzing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            <span className="font-medium">
              {analyzing ? "Analyzing..." : "Regenerate Analysis"}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Card - Indigo Style (FROM YOUR CODE) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-indigo-400 text-white shadow-xl shadow-indigo-200 p-8"
        >
          {/* Decorative Blur Blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            <div className="flex-1 space-y-3 text-center md:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-medium mb-2">
                <Award size={14} />
                AI Interview Analysis
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                {role}
              </h1>

              <p className="text-indigo-100 text-lg flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={18} className="text-indigo-200" />{" "}
                {companyName}
              </p>

              <div className="pt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-white backdrop-blur-sm">
                  <Calendar size={16} className="text-indigo-100" />
                  <span className="text-sm font-medium">
                    {formatDate(interview.startedAt)}
                  </span>
                </div>
              </div>
            </div>

            {overallScore !== null && (
              <div className="flex flex-col items-center p-4">
                <div className="relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="transparent"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="transparent"
                      stroke="#ffffff"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * overallScore) / 100}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{
                        strokeDashoffset: 440 - (440 * overallScore) / 100,
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        delay: 0.5,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold tracking-tighter text-white">
                      {overallScore}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-indigo-100 font-bold mt-1">
                      Overall
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.round(overallScore / 20)
                          ? "text-yellow-300 fill-yellow-300"
                          : "text-indigo-700/30 fill-indigo-700/30"
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Performance Breakdown - Clean White Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-center"
        >
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
            <TrendingUp className="text-indigo-500" size={20} />
            Performance Breakdown
          </h3>
          <div className="space-y-6">
            {dimensions
              .slice(0, 4)
              .map(
                (d, i) =>
                  d.dimension?.score && (
                    <HorizontalBar
                      key={i}
                      label={d.title}
                      score={d.dimension.score}
                      color={d.styleConfig.progressColor}
                    />
                  )
              )}
          </div>
        </motion.div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Detailed Feedback
          </h2>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {dimensions.map((dim, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <DimensionCard {...dim} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transcript Section */}
      {interview.transcripts && interview.transcripts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={20} />
              Interview Transcript
            </h2>
            <span className="text-xs font-medium px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
              Session Recording
            </span>
          </div>

          <div className="p-8 max-h-[600px] overflow-y-auto space-y-6 bg-slate-50/20">
            {(() => {
              const transcript = interview.transcripts[0].transcript;
              if (!transcript) return null;

              let messages: any[] = [];
              if (
                typeof transcript === "object" &&
                !Array.isArray(transcript)
              ) {
                messages = Object.keys(transcript)
                  .filter((key) => !isNaN(Number(key)))
                  .sort((a, b) => Number(a) - Number(b))
                  .map((key) => transcript[key]);
              } else if (Array.isArray(transcript)) {
                messages = transcript;
              }

              return messages.map((entry, idx) => {
                const isUser = entry.role === "user";
                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm border ${
                          isUser
                            ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                            : "bg-white border-slate-200 text-slate-500"
                        }`}
                      >
                        {isUser ? <User size={14} /> : <Zap size={14} />}
                      </div>

                      {/* Message Bubble - Matching the "Human/Real" aesthetic */}
                      <div
                        className={`p-5 shadow-sm relative group border ${
                          isUser
                            ? "bg-indigo-50 border-indigo-100 text-slate-800 rounded-2xl rounded-tr-sm"
                            : "bg-white border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {entry.text}
                        </p>

                        {entry.timestamp && (
                          <span
                            className={`text-[10px] font-mono absolute -bottom-5 ${
                              isUser
                                ? "right-1 text-slate-400"
                                : "left-1 text-slate-400"
                            } opacity-0 group-hover:opacity-100 transition-opacity`}
                          >
                            {entry.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
