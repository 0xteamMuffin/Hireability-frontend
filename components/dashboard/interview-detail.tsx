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
  gradient: string;
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
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
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
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{score}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
        <motion.div
          className="h-full rounded-full shadow-sm"
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

  const styles = {
    strength: {
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      text: "text-emerald-800",
      iconColor: "text-emerald-600",
      bullet: "bg-emerald-400",
    },
    weakness: {
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      text: "text-rose-800",
      iconColor: "text-rose-600",
      bullet: "bg-rose-400",
    },
    suggestion: {
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      text: "text-blue-800",
      iconColor: "text-blue-600",
      bullet: "bg-blue-400",
    },
  };

  const style = styles[type];

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={style.iconColor}>{icon}</span>
          <span className={`font-semibold text-sm ${style.text}`}>{title}</span>
          <span className="text-[10px] font-bold bg-white/60 px-2 py-0.5 rounded-full text-slate-600 shadow-sm">
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
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.bullet}`} />
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
  gradient,
}) => {
  const score = dimension?.score ?? null;
  const summary = dimension?.summary || dimension?.notes;
  const strengths = (dimension?.strengths as string[]) || [];
  const weaknesses = (dimension?.weaknesses as string[]) || [];
  const improvements = (dimension?.improvements as string[]) || [];

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#10b981"; 
    if (s >= 60) return "#f59e0b";
    if (s >= 40) return "#f97316"; 
    return "#ef4444"; 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl text-white shadow-lg ${gradient} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            <p className="text-xs font-medium text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-1">
              Weight: {weight}
            </p>
          </div>
        </div>
        {score !== null && (
          <CircularProgress
            score={score}
            size={64}
            strokeWidth={5}
            color={getScoreColor(score)}
          />
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5 text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
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
    month: "short",
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
  return `${minutes}m ${secs}s`;
};


export const InterviewDetail: React.FC<{ interviewId: string }> = ({
  interviewId,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [interview, setInterview] = useState<InterviewWithAnalysis | null>(null);
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

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;
  if (error || !interview) return <div className="text-center p-10 text-red-500">{error || "Not found"}</div>;

  const contextPrompt = interview.contextPrompt || "";
  const companyName = contextPrompt.match(/Target Company:\s*([^\n]+)/i)?.[1].trim() || "Target Company";
  const role = contextPrompt.match(/Target Role:\s*([^\n]+)/i)?.[1].trim() || "Role";
  const overallScore = interview.analysis?.overall?.score ?? null;

  const dimensions = [
    { title: "Problem Solving", icon: <Lightbulb size={20} />, dimension: interview.analysis?.problemSolving, weight: "20%", color: "#3b82f6", gradient: "bg-gradient-to-br from-blue-400 to-blue-600" },
    { title: "Technical Skills", icon: <Code size={20} />, dimension: interview.analysis?.technical, weight: "20%", color: "#a855f7", gradient: "bg-gradient-to-br from-purple-400 to-purple-600" },
    { title: "Role Knowledge", icon: <Briefcase size={20} />, dimension: interview.analysis?.roleKnowledge, weight: "20%", color: "#22c55e", gradient: "bg-gradient-to-br from-green-400 to-green-600" },
    { title: "Experience", icon: <TrendingUp size={20} />, dimension: interview.analysis?.experience, weight: "15%", color: "#f97316", gradient: "bg-gradient-to-br from-orange-400 to-orange-600" },
    { title: "Communication", icon: <MessageSquare size={20} />, dimension: interview.analysis?.communication, weight: "15%", color: "#ec4899", gradient: "bg-gradient-to-br from-pink-400 to-pink-600" },
    { title: "Professionalism", icon: <User size={20} />, dimension: interview.analysis?.professional, weight: "10%", color: "#6366f1", gradient: "bg-gradient-to-br from-indigo-400 to-indigo-600" },
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
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
            {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            <span className="font-medium">{analyzing ? "Analyzing..." : "Regenerate AI Analysis"}</span>
            </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white p-8 shadow-xl shadow-indigo-200"
        >
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-md mb-2">
                        <Award size={14} />
                        <span>AI Interview Analysis</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{role}</h1>
                    <p className="text-indigo-100 text-lg opacity-90">{companyName}</p>
                    
                    <div className="pt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                            <Calendar size={16} className="opacity-70" />
                            <span className="text-sm">{formatDate(interview.startedAt)}</span>
                        </div>
                    </div>
                </div>

                {overallScore !== null && (
                    <div className="flex flex-col items-center">
                         <div className="relative">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                                <motion.circle
                                    cx="80" cy="80" r="70"
                                    fill="transparent"
                                    stroke="#fff"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * overallScore) / 100}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * overallScore) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold tracking-tighter">{overallScore}</span>
                                <span className="text-sm uppercase tracking-widest opacity-70">Overall</span>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-1">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} className={i < Math.round(overallScore / 20) ? "text-yellow-400 fill-yellow-400" : "text-indigo-900/40"} />
                             ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>

        {/* Quick Stats / Summary Radar Equivalent */}
        <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-100 flex flex-col justify-center"
        >
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={20}/>
                Performance Breakdown
            </h3>
            <div className="space-y-5">
                {dimensions.slice(0, 4).map((d, i) => (
                    d.dimension?.score && (
                        <HorizontalBar key={i} label={d.title} score={d.dimension.score} color={d.color} />
                    )
                ))}
            </div>
        </motion.div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">Detailed Feedback</h2>
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
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="text-indigo-500" />
                Interview Transcript
            </h2>
            <span className="text-xs font-medium px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
                {interview.transcripts[0].transcript && Array.isArray(interview.transcripts[0].transcript) 
                 ? `${interview.transcripts[0].transcript.length} messages` 
                 : 'No messages'}
            </span>
          </div>
          
          <div className="p-6 max-h-[600px] overflow-y-auto space-y-6 bg-slate-50/30">
            {Array.isArray(interview.transcripts[0].transcript) && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (interview.transcripts[0].transcript as any[]).map((entry, idx) => {
                const isUser = entry.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                            isUser ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                        }`}>
                            {isUser ? <User size={14} /> : <Zap size={14} className="fill-slate-600" />}
                        </div>

                        <div className={`p-4 shadow-sm relative group ${
                            isUser 
                            ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" 
                            : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                        }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                            {entry.timestamp && (
                                <span className={`text-[10px] absolute -bottom-5 ${isUser ? "right-1 text-slate-400" : "left-1 text-slate-400"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    {entry.timestamp}
                                </span>
                            )}
                        </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};