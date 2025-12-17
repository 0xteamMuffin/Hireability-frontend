"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  Play,
  Loader2,
  Layers,
  Users,
  Cpu,
  Code,
  Network,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  XCircle,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  X,
  TrendingUp,
  Award,
  MessageSquare,
  Lightbulb,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sessionApi, vapiApi } from "@/lib/api";
import { 
  InterviewSession, 
  InterviewRound,
  InterviewWithAnalysis,
  AnalysisDimension,
  RoundType, 
  InterviewStatus,
  SessionStatus,
  ROUND_DISPLAY_INFO 
} from "@/lib/types";
import { useAuth } from "@/lib/hooks";

const ROUND_ICONS: Record<RoundType, React.ReactNode> = {
  [RoundType.BEHAVIORAL]: <Users size={16} />,
  [RoundType.TECHNICAL]: <Cpu size={16} />,
  [RoundType.CODING]: <Code size={16} />,
  [RoundType.SYSTEM_DESIGN]: <Network size={16} />,
  [RoundType.HR]: <Briefcase size={16} />,
};

const ROUND_ICONS_LARGE: Record<RoundType, React.ReactNode> = {
  [RoundType.BEHAVIORAL]: <Users size={20} />,
  [RoundType.TECHNICAL]: <Cpu size={20} />,
  [RoundType.CODING]: <Code size={20} />,
  [RoundType.SYSTEM_DESIGN]: <Network size={20} />,
  [RoundType.HR]: <Briefcase size={20} />,
};

const ROUND_COLORS: Record<RoundType, { bg: string; iconBg: string }> = {
  [RoundType.BEHAVIORAL]: { bg: 'bg-purple-50', iconBg: 'bg-purple-400' },
  [RoundType.TECHNICAL]: { bg: 'bg-blue-50', iconBg: 'bg-blue-400' },
  [RoundType.CODING]: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-400' },
  [RoundType.SYSTEM_DESIGN]: { bg: 'bg-orange-50', iconBg: 'bg-orange-400' },
  [RoundType.HR]: { bg: 'bg-pink-50', iconBg: 'bg-pink-400' },
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

const getDimensionData = (dimension: AnalysisDimension | null | undefined): AnalysisDimension | null => {
  if (!dimension || typeof dimension === 'string') return null;
  return dimension;
};

const InterviewsPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [interviews, setInterviews] = useState<InterviewWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abandoningSession, setAbandoningSession] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [startingRound, setStartingRound] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithAnalysis | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const ITEMS_PER_PAGE = 2;

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
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user]);

  // Debug: log interviews data
  useEffect(() => {
    if (interviews.length > 0) {
      console.log('[InterviewsPage] Loaded interviews:', interviews.map(i => ({
        id: i.id,
        sessionId: i.sessionId,
        roundType: i.roundType,
        hasAnalysis: !!i.analysis,
      })));
    }
    if (sessions.length > 0) {
      console.log('[InterviewsPage] Loaded sessions with rounds:', sessions.map(s => ({
        sessionId: s.id,
        rounds: s.rounds.map(r => ({
          id: r.id,
          roundType: r.roundType,
          interviewId: r.interviewId,
          status: r.status,
        })),
      })));
    }
  }, [interviews, sessions]);

  // Get interview for a specific round - match by round's interviewId or fallback to sessionId + roundType
  const getInterviewForRound = (round: InterviewRound): InterviewWithAnalysis | undefined => {
    // First try to match by interviewId on the round
    if (round.interviewId) {
      const byId = interviews.find(i => i.id === round.interviewId);
      if (byId) return byId;
    }
    // Fallback: match by sessionId and roundType
    const bySessionAndType = interviews.find(i => i.sessionId === round.sessionId && i.roundType === round.roundType);
    return bySessionAndType;
  };

  // Session counts for stats
  const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);

  // Get next round to continue for active session
  const getNextRound = (session: InterviewSession) => {
    return session.rounds.find(r => 
      r.status === InterviewStatus.NOT_STARTED && !r.isLocked
    ) || session.rounds.find(r => r.status === InterviewStatus.IN_PROGRESS);
  };

  const handleContinueSession = (session: InterviewSession) => {
    const nextRound = getNextRound(session);
    if (nextRound) {
      router.push(`/start?sessionId=${session.id}&roundId=${nextRound.id}&roundType=${nextRound.roundType}`);
    } else {
      // If all rounds are done, just expand the session to show rounds
      setExpandedSessionId(session.id);
    }
  };

  const handleViewRounds = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const handleViewAnalysis = (interview: InterviewWithAnalysis) => {
    setSelectedInterview(interview);
    setShowAnalysisPanel(true);
  };

  const handleCloseAnalysisPanel = () => {
    setShowAnalysisPanel(false);
    setTimeout(() => setSelectedInterview(null), 300);
  };

  const handleStartRound = async (session: InterviewSession, round: InterviewRound) => {
    try {
      setStartingRound(round.id);
      
      // Mark round as in progress
      await sessionApi.startRound({
        sessionId: session.id,
        roundId: round.id,
      });
      
      // Navigate to interview with session and round info
      router.push(`/start?sessionId=${session.id}&roundId=${round.id}&roundType=${round.roundType}`);
    } catch (err) {
      console.error('Start round error:', err);
    } finally {
      setStartingRound(null);
    }
  };

  const handleAbandonSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to abandon this session? This cannot be undone.')) {
      return;
    }
    
    try {
      setAbandoningSession(sessionId);
      await sessionApi.abandonSession(sessionId);
      const sessionsRes = await sessionApi.getSessions();
      if (sessionsRes.success && sessionsRes.data) {
        setSessions(sessionsRes.data);
      }
    } catch (err) {
      console.error('Failed to abandon session:', err);
    } finally {
      setAbandoningSession(null);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? All associated data will be permanently removed.')) {
      return;
    }
    
    try {
      setDeletingSession(sessionId);
      await sessionApi.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Failed to delete session. Please try again.');
    } finally {
      setDeletingSession(null);
    }
  };

  const handleStartNewSession = () => {
    router.push('/config');
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
            Interviews
          </h1>
          <p className="text-slate-500">
            Manage your interview sessions and continue practicing
          </p>
        </div>
        <button
          onClick={handleStartNewSession}
          className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
        >
          <Plus size={18} />
          New Session
        </button>
      </header>

      {/* No Sessions - Start New */}
      {sessions.length === 0 && (
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-400 to-purple-400 rounded-[2rem] p-8 shadow-xl text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Layers size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Practice?</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Start your first interview session to practice with AI-powered mock interviews
            </p>
            <button
              onClick={handleStartNewSession}
              className="bg-white hover:bg-slate-100 text-indigo-600 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 group"
            >
              <Play size={20} className="fill-indigo-600" />
              Start Your First Session
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      )}

      {/* Session Stats */}
      {sessions.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-500">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{sessions.length}</p>
                <p className="text-sm text-slate-500">Total Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl text-green-500">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{completedSessions.length}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {sessions.reduce((acc, s) => acc + s.rounds.filter(r => r.status === InterviewStatus.COMPLETED).length, 0)}
                </p>
                <p className="text-sm text-slate-500">Rounds Completed</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sessions List */}
      {sessions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">All Sessions</h2>
            <span className="text-sm text-slate-500">{sessions.length} total</span>
          </div>
          <div className="space-y-4">
            {sessions
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((session, idx) => {
              const completedRounds = session.rounds.filter(r => r.status === InterviewStatus.COMPLETED).length;
              const progress = (completedRounds / session.totalRounds) * 100;
              const isActive = session.status === SessionStatus.IN_PROGRESS;
              const isCompleted = session.status === SessionStatus.COMPLETED;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white/60 backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all ${
                    isActive ? 'border-indigo-200' : 'border-white'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${
                        isCompleted ? 'bg-green-400' : isActive ? 'bg-indigo-400' : 'bg-slate-400'
                      }`}>
                        <Layers size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">
                          Interview Session
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                            {session.status === SessionStatus.COMPLETED ? 'Completed' : 
                             session.status === SessionStatus.IN_PROGRESS ? 'In Progress' : 'Abandoned'}
                          </span>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(session.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">
                          {completedRounds} / {session.totalRounds} rounds
                        </p>
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isCompleted ? 'bg-green-400' : 'bg-indigo-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rounds Summary Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {session.rounds.map((round) => (
                      <div
                        key={round.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                          round.status === InterviewStatus.COMPLETED
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : round.status === InterviewStatus.IN_PROGRESS
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : round.status === InterviewStatus.SKIPPED
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        {ROUND_ICONS[round.roundType]}
                        <span className="font-medium">
                          {ROUND_DISPLAY_INFO[round.roundType].title.replace(' Round', '')}
                        </span>
                        {round.status === InterviewStatus.COMPLETED && (
                          <CheckCircle2 size={14} className="text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingSession === session.id}
                      className="text-red-400 hover:text-red-500 p-2.5 rounded-full transition-all flex items-center gap-2 border border-red-100 hover:border-red-200 hover:bg-red-50"
                      title="Delete Session"
                    >
                      {deletingSession === session.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                    {isActive && (
                      <>
                        <button
                          onClick={() => handleViewRounds(session.id)}
                          className="text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 border border-slate-200 hover:border-slate-300"
                        >
                          {expandedSessionId === session.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          {expandedSessionId === session.id ? 'Hide Rounds' : 'View Rounds'}
                        </button>
                        <button
                          onClick={() => handleContinueSession(session)}
                          className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Play size={16} className="fill-white" />
                          Continue
                        </button>
                      </>
                    )}
                    {isCompleted && (
                      <button
                        onClick={() => handleViewRounds(session.id)}
                        className="text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 border border-slate-200 hover:border-slate-300"
                      >
                        {expandedSessionId === session.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        {expandedSessionId === session.id ? 'Hide Rounds' : 'View Rounds'}
                      </button>
                    )}
                    {session.status === SessionStatus.ABANDONED && (
                      <button
                        onClick={() => handleViewRounds(session.id)}
                        className="text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 border border-slate-200 hover:border-slate-300"
                      >
                        {expandedSessionId === session.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        {expandedSessionId === session.id ? 'Hide Rounds' : 'View Rounds'}
                      </button>
                    )}
                  </div>

                  {/* Expanded Rounds Panel */}
                  <AnimatePresence>
                    {expandedSessionId === session.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-slate-200"
                      >
                        <h4 className="text-slate-700 font-semibold mb-4">Interview Rounds</h4>
                        <div className="grid gap-3">
                          {session.rounds.map((round, roundIndex) => {
                            const info = ROUND_DISPLAY_INFO[round.roundType];
                            const colors = ROUND_COLORS[round.roundType];
                            const roundCompleted = round.status === InterviewStatus.COMPLETED;
                            const roundSkipped = round.status === InterviewStatus.SKIPPED;
                            const roundInProgress = round.status === InterviewStatus.IN_PROGRESS;
                            const roundLocked = round.isLocked;
                            const canStartRound = !roundLocked && !roundCompleted && !roundSkipped && isActive;
                            const interview = getInterviewForRound(round);
                            const score = interview ? getOverallScore(interview) : null;

                            return (
                              <motion.div
                                key={round.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: roundIndex * 0.05 }}
                                className={`bg-white/80 border rounded-xl p-4 flex items-center justify-between ${
                                  roundCompleted ? 'border-green-200 bg-green-50/50' : 'border-slate-200'
                                } ${roundLocked ? 'opacity-60' : ''}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl text-white ${
                                    roundCompleted ? 'bg-green-400' : roundLocked ? 'bg-slate-300' : colors.iconBg
                                  }`}>
                                    {ROUND_ICONS_LARGE[round.roundType]}
                                  </div>
                                  <div>
                                    <h5 className="text-slate-800 font-semibold">{info.title}</h5>
                                    <p className="text-slate-500 text-sm">~{info.estimatedDuration} min</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {/* Inline Score Badge for Completed Rounds */}
                                  {roundCompleted && score !== null && (
                                    <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                                      score >= 80 ? 'bg-green-100 text-green-700' :
                                      score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {score.toFixed(0)}%
                                    </div>
                                  )}
                                  {roundCompleted && score === null && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                                      <CheckCircle2 size={14} />
                                      Completed
                                    </span>
                                  )}
                                  {roundSkipped && (
                                    <span className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-600 text-xs font-medium">
                                      Skipped
                                    </span>
                                  )}
                                  {roundInProgress && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium animate-pulse">
                                      In Progress
                                    </span>
                                  )}
                                  {roundLocked && !roundCompleted && !roundSkipped && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                                      <Lock size={12} />
                                      Locked
                                    </span>
                                  )}
                                  {/* Details Button for Completed Rounds with Analysis */}
                                  {roundCompleted && interview?.analysis && (
                                    <button
                                      onClick={() => handleViewAnalysis(interview)}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium text-sm transition-all"
                                    >
                                      <Eye size={14} />
                                      Details
                                    </button>
                                  )}
                                  {/* View Button for Completed Rounds without Analysis (navigate to analytics page) */}
                                  {roundCompleted && interview && !interview.analysis && (
                                    <button
                                      onClick={() => router.push(`/dashboard/analytics/${interview.id}`)}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-sm transition-all"
                                    >
                                      <Eye size={14} />
                                      View
                                    </button>
                                  )}
                                  {canStartRound && (
                                    <button
                                      onClick={() => handleStartRound(session, round)}
                                      disabled={startingRound === round.id}
                                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                                    >
                                      {startingRound === round.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : (
                                        <Play size={14} className="fill-white" />
                                      )}
                                      {roundInProgress ? 'Continue' : 'Start'}
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {sessions.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              {Array.from({ length: Math.ceil(sessions.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(sessions.length / ITEMS_PER_PAGE), p + 1))}
                disabled={currentPage === Math.ceil(sessions.length / ITEMS_PER_PAGE)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Analysis Slide-out Panel */}
      <AnimatePresence>
        {showAnalysisPanel && selectedInterview && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAnalysisPanel}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Panel Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl text-white ${
                    selectedInterview.roundType ? ROUND_COLORS[selectedInterview.roundType as RoundType]?.iconBg : 'bg-indigo-400'
                  }`}>
                    {selectedInterview.roundType ? ROUND_ICONS_LARGE[selectedInterview.roundType as RoundType] : <Target size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {selectedInterview.roundType ? ROUND_DISPLAY_INFO[selectedInterview.roundType as RoundType]?.title : 'Interview'} Analysis
                    </h3>
                    <p className="text-sm text-slate-500">{formatDate(selectedInterview.startedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleCloseAnalysisPanel();
                      router.push(`/dashboard/analytics/${selectedInterview.id}`);
                    }}
                    className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium text-sm transition-all flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    Full Report
                  </button>
                  <button
                    onClick={handleCloseAnalysisPanel}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="p-6 space-y-6">
                {/* Overall Score - Clickable to Full Report */}
                {selectedInterview.analysis?.overall && (
                  <button
                    onClick={() => {
                      handleCloseAnalysisPanel();
                      router.push(`/dashboard/analytics/${selectedInterview.id}`);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl p-6 text-center transition-all group"
                  >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      (getScore(selectedInterview.analysis.overall) ?? 0) >= 80 ? 'bg-green-100 text-green-600' :
                      (getScore(selectedInterview.analysis.overall) ?? 0) >= 60 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <span className="text-3xl font-bold">
                        {getScore(selectedInterview.analysis.overall)?.toFixed(0) ?? 'N/A'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">Overall Score</h4>
                    {getDimensionData(selectedInterview.analysis.overall)?.summary && (
                      <p className="text-slate-600 text-sm">{getDimensionData(selectedInterview.analysis.overall)?.summary}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-indigo-500 text-sm mt-3 group-hover:gap-2 transition-all">
                      View detailed analysis <ChevronRight size={14} />
                    </span>
                  </button>
                )}

                {/* Dimension Scores */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-400" />
                    Performance Breakdown
                  </h4>
                  
                  {[
                    { key: 'technical', label: 'Technical Skills', icon: <Cpu size={16} /> },
                    { key: 'communication', label: 'Communication', icon: <MessageSquare size={16} /> },
                    { key: 'problemSolving', label: 'Problem Solving', icon: <Lightbulb size={16} /> },
                    { key: 'roleKnowledge', label: 'Role Knowledge', icon: <Target size={16} /> },
                    { key: 'professional', label: 'Professionalism', icon: <Award size={16} /> },
                  ].map(({ key, label, icon }) => {
                    const dimension = getDimensionData(selectedInterview.analysis?.[key as keyof typeof selectedInterview.analysis] as AnalysisDimension);
                    const score = dimension?.score;
                    if (score === null || score === undefined) return null;
                    
                    return (
                      <div key={key} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="text-slate-400">{icon}</span>
                            <span className="font-medium">{label}</span>
                          </div>
                          <span className={`font-bold ${
                            score >= 80 ? 'text-green-600' :
                            score >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {score.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              score >= 80 ? 'bg-green-400' :
                              score >= 60 ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        {dimension?.notes && (
                          <p className="text-sm text-slate-500 mt-2">{dimension.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Strengths */}
                {getDimensionData(selectedInterview.analysis?.overall)?.strengths && 
                 getDimensionData(selectedInterview.analysis?.overall)!.strengths!.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-green-500" />
                      Key Strengths
                    </h4>
                    <div className="space-y-2">
                      {getDimensionData(selectedInterview.analysis?.overall)!.strengths!.map((strength, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-green-50 rounded-lg p-3 text-green-700 text-sm">
                          <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                          {strength}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for Improvement */}
                {getDimensionData(selectedInterview.analysis?.overall)?.improvements && 
                 getDimensionData(selectedInterview.analysis?.overall)!.improvements!.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Lightbulb size={18} className="text-amber-500" />
                      Areas to Improve
                    </h4>
                    <div className="space-y-2">
                      {getDimensionData(selectedInterview.analysis?.overall)!.improvements!.map((improvement, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 text-amber-700 text-sm">
                          <ArrowRight size={14} className="mt-0.5 flex-shrink-0" />
                          {improvement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InterviewsPage;
