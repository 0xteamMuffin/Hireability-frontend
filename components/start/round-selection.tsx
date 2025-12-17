"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Cpu, 
  Code, 
  Network, 
  Briefcase, 
  Lock, 
  CheckCircle2, 
  Play, 
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Layers,
  XCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { sessionApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks';
import {
  InterviewSession,
  InterviewRound,
  RoundType,
  InterviewStatus,
  ROUND_DISPLAY_INFO,
} from '@/lib/types';

const ROUND_ICONS: Record<RoundType, React.ReactNode> = {
  [RoundType.BEHAVIORAL]: <Users size={24} />,
  [RoundType.TECHNICAL]: <Cpu size={24} />,
  [RoundType.CODING]: <Code size={24} />,
  [RoundType.SYSTEM_DESIGN]: <Network size={24} />,
  [RoundType.HR]: <Briefcase size={24} />,
};

const ROUND_COLORS: Record<RoundType, { bg: string; text: string; border: string; iconBg: string }> = {
  [RoundType.BEHAVIORAL]: { 
    bg: 'bg-purple-50', 
    text: 'text-purple-600', 
    border: 'border-purple-200',
    iconBg: 'bg-purple-400'
  },
  [RoundType.TECHNICAL]: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-600', 
    border: 'border-blue-200',
    iconBg: 'bg-blue-400'
  },
  [RoundType.CODING]: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-600', 
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-400'
  },
  [RoundType.SYSTEM_DESIGN]: { 
    bg: 'bg-orange-50', 
    text: 'text-orange-600', 
    border: 'border-orange-200',
    iconBg: 'bg-orange-400'
  },
  [RoundType.HR]: { 
    bg: 'bg-pink-50', 
    text: 'text-pink-600', 
    border: 'border-pink-200',
    iconBg: 'bg-pink-400'
  },
};

interface RoundCardProps {
  round: InterviewRound;
  onStart: () => void;
  index: number;
}

const RoundCard: React.FC<RoundCardProps> = ({ round, onStart, index }) => {
  const info = ROUND_DISPLAY_INFO[round.roundType];
  const colors = ROUND_COLORS[round.roundType];
  const isCompleted = round.status === InterviewStatus.COMPLETED;
  const isSkipped = round.status === InterviewStatus.SKIPPED;
  const isInProgress = round.status === InterviewStatus.IN_PROGRESS;
  const isLocked = round.isLocked;
  const canStart = !isLocked && !isCompleted && !isSkipped;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative bg-white/60 backdrop-blur-md border rounded-2xl p-6 shadow-sm
        transition-all duration-300 hover:shadow-lg
        ${isCompleted ? 'border-green-300 bg-green-50/60' : ''}
        ${isLocked ? 'opacity-60 border-slate-200' : 'border-white'}
        ${canStart ? 'hover:border-indigo-300 cursor-pointer' : ''}
      `}
      onClick={canStart ? onStart : undefined}
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        {isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
            <CheckCircle2 size={14} />
            Completed
          </span>
        )}
        {isSkipped && (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-600 text-xs font-medium">
            Skipped
          </span>
        )}
        {isInProgress && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            In Progress
          </span>
        )}
        {isLocked && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
            <Lock size={12} />
            Locked
          </span>
        )}
        {canStart && !isInProgress && (
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium">
            Ready
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          p-4 rounded-xl text-white shadow-lg
          ${isCompleted ? 'bg-green-400' : isLocked ? 'bg-slate-300' : colors.iconBg}
        `}>
          {ROUND_ICONS[round.roundType]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 mb-1 pr-24">{info.title}</h3>
          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{info.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                ~{info.estimatedDuration} min
              </span>
            </div>
            
            {canStart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm
                  transition-all shadow-md hover:shadow-lg
                  ${isInProgress 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-indigo-400 hover:bg-indigo-500 text-white'
                  }
                `}
              >
                <Play size={16} className="fill-white" />
                {isInProgress ? 'Continue' : 'Start Round'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RoundSelection: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const targetId = searchParams.get('targetId');
  const { user, isLoading: authLoading } = useAuth();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [checkingMode, setCheckingMode] = useState(true);
  const [abandoning, setAbandoning] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // First check if multi-round mode is enabled
        setCheckingMode(true);
        const modeResp = await sessionApi.isMultiRoundEnabled();
        setCheckingMode(false);
        
        if (!modeResp.success || !modeResp.data?.multiRoundEnabled) {
          // Multi-round disabled - go directly to interview
          const params = new URLSearchParams();
          if (targetId) params.append('targetId', targetId);
          router.replace(`/start?${params.toString()}`);
          return;
        }
        
        // If sessionId provided, load that session
        if (sessionId) {
          const sessionResp = await sessionApi.getSession(sessionId);
          if (sessionResp.success && sessionResp.data) {
            setSession(sessionResp.data);
            return;
          }
        }
        
        // Check for active session
        const activeResp = await sessionApi.getActiveSession();
        if (activeResp.success && activeResp.data) {
          setSession(activeResp.data);
          return;
        }
        
        // Create new session
        setCreating(true);
        const createResp = await sessionApi.createSession({
          targetId: targetId || undefined,
        });
        
        if (createResp.success && createResp.data) {
          setSession(createResp.data);
        } else {
          setError('Failed to create interview session');
        }
      } catch (err) {
        console.error('Session init error:', err);
        setError('Failed to initialize session');
      } finally {
        setLoading(false);
        setCreating(false);
      }
    };
    
    initSession();
  }, [user, sessionId, targetId, router]);

  const handleStartRound = async (round: InterviewRound) => {
    if (!session) return;
    
    try {
      // Mark round as in progress
      await sessionApi.startRound({
        sessionId: session.id,
        roundId: round.id,
      });
      
      // Navigate to interview with session and round info
      const params = new URLSearchParams({
        sessionId: session.id,
        roundId: round.id,
        roundType: round.roundType,
      });
      if (targetId) params.append('targetId', targetId);
      
      router.push(`/start?${params.toString()}`);
    } catch (err) {
      console.error('Start round error:', err);
      setError('Failed to start round');
    }
  };

  const handleAbandon = async () => {
    if (!session) return;
    
    if (!confirm('Are you sure you want to abandon this interview session? This cannot be undone.')) {
      return;
    }
    
    try {
      setAbandoning(true);
      await sessionApi.abandonSession(session.id);
      router.push('/dashboard/interviews');
    } catch (err) {
      console.error('Abandon error:', err);
    } finally {
      setAbandoning(false);
    }
  };

  // Loading State
  if (authLoading || loading || checkingMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl mb-6 mx-auto">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
          <p className="text-slate-600 font-medium">
            {checkingMode ? 'Checking interview mode...' : creating ? 'Setting up your interview...' : 'Loading...'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-8 shadow-xl text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold shadow-md transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const completedRounds = session.rounds.filter(
    r => r.status === InterviewStatus.COMPLETED || r.status === InterviewStatus.SKIPPED
  ).length;
  const progress = (completedRounds / session.totalRounds) * 100;
  const allComplete = completedRounds === session.totalRounds;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/dashboard/interviews')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Interviews</span>
          </button>

          <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Layers size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Interview Session</h1>
                  <p className="text-slate-500">Complete each round to finish your mock interview</p>
                </div>
              </div>
              
              <button
                onClick={handleAbandon}
                disabled={abandoning}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all"
              >
                {abandoning ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Abandon Session
              </button>
            </div>
            
            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Progress</span>
                <span className="text-sm font-bold text-slate-800">
                  {completedRounds} of {session.totalRounds} rounds
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Rounds */}
        <div className="space-y-4">
          {session.rounds.map((round, index) => (
            <RoundCard
              key={round.id}
              round={round}
              onStart={() => handleStartRound(round)}
              index={index}
            />
          ))}
        </div>

        {/* All Complete */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl p-8 shadow-xl text-center text-white"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-white/80 mb-6">Great job! You've completed all interview rounds.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard/interviews')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold transition-all inline-flex items-center justify-center gap-2"
              >
                Back to Interviews
              </button>
              <button
                onClick={() => router.push('/dashboard/analytics')}
                className="bg-white hover:bg-slate-50 text-green-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
              >
                View Analytics
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoundSelection;
