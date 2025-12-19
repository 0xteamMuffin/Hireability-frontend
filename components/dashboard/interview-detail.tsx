'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { vapiApi } from '@/lib/api';
import { InterviewWithAnalysis, AnalysisDimension } from '@/lib/types';
import { useAuth } from '@/lib/hooks';

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
          stroke="#e2e8f0"
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
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl leading-none font-bold text-slate-800">{score.toFixed(0)}</span>
        <span className="mt-0.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
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
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{score}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-slate-200/60 bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
  type: 'strength' | 'weakness' | 'suggestion';
}> = ({ title, icon, items, type }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  const styles = {
    strength: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      bullet: 'bg-emerald-500',
    },
    weakness: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-700',
      iconColor: 'text-red-600',
      bullet: 'bg-red-500',
    },
    suggestion: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      iconColor: 'text-blue-600',
      bullet: 'bg-blue-500',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden transition-all duration-300`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/40"
      >
        <div className="flex items-center gap-2.5">
          <span className={style.iconColor}>{icon}</span>
          <span className={`text-sm font-semibold ${style.text}`}>{title}</span>
          <span className="rounded-full border border-black/5 bg-white/60 px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm">
            {items.length}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className={style.iconColor} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="space-y-2.5 px-4 pb-4">
              {items.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${style.bullet}`}
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
      className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl p-3 ${styleConfig.iconBg} ${styleConfig.text} border shadow-sm ${styleConfig.border}`}
          >
            {icon}
          </div>
          <div>
            <div className="relative flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>

              {/* Tooltip */}
              <div
                className="relative cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info
                  size={16}
                  className="text-slate-400 transition-colors hover:text-indigo-500"
                />
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-xl bg-slate-800 p-3 text-xs text-white shadow-xl"
                    >
                      <div className="relative z-10 text-center leading-relaxed font-medium">
                        {calculationLogic}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="mt-1 inline-block rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
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
        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-600">
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
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const InterviewDetail: React.FC<{ interviewId: string }> = ({ interviewId }) => {
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
        else setError(response.error || 'Failed to load');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [user, interviewId]);

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  if (error || !interview)
    return <div className="p-10 text-center text-red-500">{error || 'Not found'}</div>;

  const contextPrompt = interview.contextPrompt || '';
  const companyName =
    contextPrompt.match(/Target Company:\s*([^\n]+)/i)?.[1].trim() || 'Target Company';
  const role = contextPrompt.match(/Target Role:\s*([^\n]+)/i)?.[1].trim() || 'Role';
  const overallScore = interview.analysis?.overall?.score ?? null;

  const dimensions = [
    {
      title: 'Problem Solving',
      icon: <Lightbulb size={20} />,
      dimension: interview.analysis?.problemSolving,
      weight: '20%',
      styleConfig: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
        iconBg: 'bg-blue-50',
        progressColor: '#3b82f6',
      },
      calculationLogic: "Evaluated based on the user's responses to problem scenarios provided.",
    },
    {
      title: 'Technical Skills',
      icon: <Code size={20} />,
      dimension: interview.analysis?.technical,
      weight: '20%',
      styleConfig: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-100',
        iconBg: 'bg-purple-50',
        progressColor: '#a855f7',
      },
      calculationLogic:
        'Evaluated based on the accuracy and depth of technical responses given by the user.',
    },
    {
      title: 'Role Knowledge',
      icon: <Briefcase size={20} />,
      dimension: interview.analysis?.roleKnowledge,
      weight: '20%',
      styleConfig: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100',
        iconBg: 'bg-emerald-50',
        progressColor: '#10b981',
      },
      calculationLogic:
        'Calculated by checking role knowledge against the specific context and job applied for.',
    },
    {
      title: 'Experience',
      icon: <TrendingUp size={20} />,
      dimension: interview.analysis?.experience,
      weight: '15%',
      styleConfig: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-100',
        iconBg: 'bg-orange-50',
        progressColor: '#f97316',
      },
      calculationLogic:
        'Assessed by cross-referencing the resume details with experience mentioned during the talk.',
    },
    {
      title: 'Communication',
      icon: <MessageSquare size={20} />,
      dimension: interview.analysis?.communication,
      weight: '15%',
      styleConfig: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-100',
        iconBg: 'bg-pink-50',
        progressColor: '#ec4899',
      },
      calculationLogic: 'Analyzed through voice processing, clarity, and articulation evaluation.',
    },
    {
      title: 'Professionalism',
      icon: <User size={20} />,
      dimension: interview.analysis?.professional,
      weight: '10%',
      styleConfig: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-100',
        iconBg: 'bg-indigo-50',
        progressColor: '#6366f1',
      },
      calculationLogic: 'Determined by evaluating expression usage.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl space-y-8 pb-20"
    >
      {/* Navbar / Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleRetryAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-indigo-600 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            <span className="font-medium">
              {analyzing ? 'Analyzing...' : 'Regenerate Analysis'}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Score Card - Indigo Style (FROM YOUR CODE) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative overflow-hidden rounded-[2rem] bg-indigo-400 p-8 text-white shadow-xl shadow-indigo-200 lg:col-span-2"
        >
          {/* Decorative Blur Blob */}
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-10 blur-3xl"></div>

          <div className="relative z-10 flex h-full flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex-1 space-y-3 text-center md:text-left">
              {/* Badge */}
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                <Award size={14} />
                AI Interview Analysis
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white">{role}</h1>

              <p className="flex items-center justify-center gap-2 text-lg text-indigo-100 md:justify-start">
                <Briefcase size={18} className="text-indigo-200" /> {companyName}
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-6 md:justify-start">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
                  <Calendar size={16} className="text-indigo-100" />
                  <span className="text-sm font-medium">{formatDate(interview.startedAt)}</span>
                </div>
              </div>
            </div>

            {overallScore !== null && (
              <div className="flex flex-col items-center p-4">
                <div className="relative">
                  <svg className="h-40 w-40 -rotate-90 transform">
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
                        ease: 'easeOut',
                        delay: 0.5,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold tracking-tighter text-white">
                      {overallScore}
                    </span>
                    <span className="mt-1 text-xs font-bold tracking-widest text-indigo-100 uppercase">
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
                          ? 'fill-yellow-300 text-yellow-300'
                          : 'fill-indigo-700/30 text-indigo-700/30'
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
          className="flex flex-col justify-center rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
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
                  ),
              )}
          </div>
        </motion.div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Detailed Feedback</h2>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
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
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <MessageSquare className="text-indigo-500" size={20} />
              Interview Transcript
            </h2>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
              Session Recording
            </span>
          </div>

          <div className="max-h-[600px] space-y-6 overflow-y-auto bg-slate-50/20 p-8">
            {(() => {
              const transcript = interview.transcripts[0].transcript;
              if (!transcript) return null;

              let messages: any[] = [];
              if (typeof transcript === 'object' && !Array.isArray(transcript)) {
                messages = Object.keys(transcript)
                  .filter((key) => !isNaN(Number(key)))
                  .sort((a, b) => Number(a) - Number(b))
                  .map((key) => transcript[key]);
              } else if (Array.isArray(transcript)) {
                messages = transcript;
              }

              return messages.map((entry, idx) => {
                const isUser = entry.role === 'user';
                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`flex max-w-[85%] gap-3 md:max-w-[70%] ${
                        isUser ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm ${
                          isUser
                            ? 'border-indigo-100 bg-indigo-50 text-indigo-600'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        {isUser ? <User size={14} /> : <Zap size={14} />}
                      </div>

                      {/* Message Bubble - Matching the "Human/Real" aesthetic */}
                      <div
                        className={`group relative border p-5 shadow-sm ${
                          isUser
                            ? 'rounded-2xl rounded-tr-sm border-indigo-100 bg-indigo-50 text-slate-800'
                            : 'rounded-2xl rounded-tl-sm border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                          {entry.text}
                        </p>

                        {entry.timestamp && (
                          <span
                            className={`absolute -bottom-5 font-mono text-[10px] ${
                              isUser ? 'right-1 text-slate-400' : 'left-1 text-slate-400'
                            } opacity-0 transition-opacity group-hover:opacity-100`}
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
