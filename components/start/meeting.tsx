/**
 * Meeting Component - Unified Interview Experience
 * Single, clean interface - just video + transcript
 */

"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertCircle, Loader2, Radio, Wifi, WifiOff, TrendingUp } from 'lucide-react';
import MeetingVideo from './meeting-video';
import { useAuth, useVapi, useSocket } from '@/lib/hooks';
import Transcriber from './transcriber';
import VapiOrb from './ui/vapi-orb';
import MeetingControls from './ui/metting-controls';
import { useSearchParams, useRouter } from 'next/navigation';
import InteractiveCodeEditor from './interactive-code-editor';
import { useInterviewStore, selectIsCodingPhase } from '@/lib/stores/interview-store';
import { RoundType as OldRoundType, ROUND_DISPLAY_INFO } from '@/lib/types';
import { sessionApi } from '@/lib/api';

const useTime = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Meeting: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get('targetId');
  const sessionId = searchParams.get('sessionId');
  const roundId = searchParams.get('roundId');
  const roundType = searchParams.get('roundType') as OldRoundType | null;

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [orbScale, setOrbScale] = useState(1);
  const animationRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  
  // Store interviewId in a ref to persist it through call cleanup
  const lastInterviewIdRef = useRef<string | null>(null);

  // Interview store state
  const {
    isConnected: socketConnected,
    interviewState,
    codingProblem,
    isCodeEditorOpen,
    setCodeEditorOpen,
    reset: resetStore,
  } = useInterviewStore();
  
  const isCodingPhase = useInterviewStore(selectIsCodingPhase);

  // Expression data collection
  const expressionDataRef = useRef<Record<string, number[]>>({
    angry: [], sad: [], happy: [], neutral: [],
    surprised: [], fearful: [], disgusted: [],
  });

  const getAverageExpressions = useCallback((): Record<string, number> => {
    const averages: Record<string, number> = {};
    Object.entries(expressionDataRef.current).forEach(([emotion, values]) => {
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        averages[emotion] = Math.round((sum / values.length) * 100) / 100;
      } else {
        averages[emotion] = 0;
      }
    });
    expressionDataRef.current = {
      angry: [], sad: [], happy: [], neutral: [],
      surprised: [], fearful: [], disgusted: [],
    };
    return averages;
  }, []);

  // VAPI hook
  const {
    vapiClient,
    callStatus,
    isSpeaking,
    vapiError,
    contextStatus,
    context,
    conversation,
    startInterview,
    stopInterview,
    isCallEnding,
    interviewId,
    emitExpressionUpdate,
  } = useVapi({
    user,
    targetId,
    sessionId,
    roundType: roundType || undefined,
    getAverageExpressions,
  });

  // Socket connection
  const { emitCodeUpdate } = useSocket({
    interviewId,
    userId: user?.id || null,
    enabled: !!interviewId,
  });

  // Keep ref updated with latest interviewId for use after cleanup
  useEffect(() => {
    if (interviewId) {
      lastInterviewIdRef.current = interviewId;
    }
  }, [interviewId]);

  const currentTime = useTime();

  const toggleMic = () => setMicOn((prev) => !prev);
  const toggleCamera = () => setCameraOn((prev) => !prev);

  // Handle round completion - use ref to get interviewId as it may be cleared by call-end handler
  const handleRoundComplete = async () => {
    if (!sessionId || !roundId) {
      router.push('/dashboard/analytics');
      return;
    }
    
    // Use the ref value which persists even after vapi cleanup
    const completedInterviewId = lastInterviewIdRef.current;
    
    try {
      await sessionApi.completeRound({
        sessionId,
        roundId,
        interviewId: completedInterviewId || undefined,
      });
      router.push('/dashboard/interviews');
    } catch (err) {
      console.error('Failed to complete round:', err);
      router.push('/dashboard/interviews');
    }
  };

  // Handle expression data
  const handleExpressionChange = useCallback((expressions: Record<string, number>) => {
    Object.entries(expressions).forEach(([emotion, value]) => {
      if (emotion in expressionDataRef.current) {
        expressionDataRef.current[emotion].push(value);
      }
    });
    emitExpressionUpdate(expressions);
  }, [emitExpressionUpdate]);

  // Handle code changes
  const handleCodeChange = useCallback((code: string, language: string) => {
    emitCodeUpdate(code, language);
  }, [emitCodeUpdate]);

  // Auto-start interview
  useEffect(() => {
    if (vapiClient && callStatus === 'idle' && contextStatus !== 'loading' && !vapiError && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startInterview();
    }
  }, [vapiClient, callStatus, contextStatus, vapiError, startInterview]);

  // Reset store on unmount
  useEffect(() => {
    return () => resetStore();
  }, [resetStore]);

  // Orb animation
  useEffect(() => {
    const animate = () => {
      if (isSpeaking) {
        const time = Date.now();
        const scale = 1.05 + Math.sin(time / 400) * 0.1;
        setOrbScale(scale);
      } else {
        setOrbScale(1);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSpeaking]);

  // Auto-open code editor
  useEffect(() => {
    if (isCodingPhase && codingProblem && !isCodeEditorOpen) {
      setCodeEditorOpen(true);
    }
  }, [isCodingPhase, codingProblem, isCodeEditorOpen, setCodeEditorOpen]);

  // Permission error screen
  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#202124] text-white p-4 text-center">
        <div className="bg-red-500/20 p-5 rounded-full mb-6">
          <AlertCircle size={64} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-medium mb-3">Camera or Mic Blocked</h1>
        <p className="text-gray-300 mb-8 max-w-md">{permissionError}</p>
        <div className="bg-[#3c4043] p-6 rounded-xl text-left text-gray-200 max-w-md w-full border border-white/10">
          <p className="font-bold mb-4 text-white">How to enable access:</p>
          <ol className="list-decimal pl-5 space-y-3 text-sm">
            <li>Click the Lock icon in your address bar</li>
            <li>Allow Camera and Microphone access</li>
            <li>Click refresh below</li>
          </ol>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Saving screen
  if (isCallEnding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#202124] text-white">
        <Loader2 size={48} className="animate-spin text-green-400 mb-4" />
        <p className="text-lg text-white/80">Saving your interview...</p>
        <p className="text-sm text-white/60 mt-2">Please wait while we analyze your session</p>
      </div>
    );
  }

  // Connecting screen
  if (callStatus !== 'in-call') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#202124] text-white">
        <Loader2 size={48} className="animate-spin text-indigo-400 mb-4" />
        <p className="text-lg text-white/80">Connecting to interview...</p>
        {vapiError && <p className="text-sm text-red-400 mt-2 px-4 text-center">{vapiError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#202124] text-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 h-14 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
            socketConnected 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
          }`}>
            {socketConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{socketConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
          
          {/* Round type */}
          {roundType && (
            <span className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
              {ROUND_DISPLAY_INFO[roundType]?.title || roundType}
            </span>
          )}

          {/* Interview progress */}
          {interviewState && (
            <>
              {interviewState.questionsAsked > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <TrendingUp size={12} />
                  <span>Q{interviewState.questionsAsked}</span>
                  {interviewState.performance?.averageScore > 0 && (
                    <span className="text-green-400">
                      ({interviewState.performance.averageScore.toFixed(1)}/10)
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-lg font-medium text-white/90">{currentTime}</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 bg-[#3c4043] rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10 min-h-[40vh] lg:min-h-0">
          <VapiOrb isSpeaking={isSpeaking} orbScale={orbScale} />

          <div className="absolute bottom-4 left-4 text-white font-medium text-sm bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-2">
              <Radio size={12} className={isSpeaking ? 'animate-pulse text-green-400' : 'text-white/60'} />
              <span>AI Interviewer</span>
              {isSpeaking && <span className="text-xs text-green-400">Speaking...</span>}
            </div>
          </div>

          {/* User Video */}
          <div className="absolute bottom-4 right-4 w-40 h-28 md:bottom-8 md:right-8 md:w-56 md:h-36">
            <MeetingVideo
              cameraOn={cameraOn}
              micOn={micOn}
              setPermissionError={setPermissionError}
              userInitial={user?.username?.[0]?.toUpperCase() || 'Y'}
              onExpressionChange={handleExpressionChange}
            />
          </div>
        </div>

        {/* Sidebar - Just Transcript */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-3 max-h-[45vh] lg:max-h-full overflow-hidden">
          {/* Status */}
          <div className="bg-[#2a2d32] rounded-xl p-3 ring-1 ring-white/10 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">
                  {context?.profile?.targetRole || 'Interview'} 
                  {context?.profile?.targetCompany && ` @ ${context.profile.targetCompany}`}
                </p>
              </div>
              <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${
                isSpeaking 
                  ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
              }`}>
                <Radio size={12} className={isSpeaking ? 'animate-pulse' : ''} />
                {isSpeaking ? 'Speaking' : 'Listening'}
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 bg-[#2a2d32] rounded-xl ring-1 ring-white/10 overflow-hidden min-h-0">
            <Transcriber conversation={conversation} />
          </div>

          {/* Error display */}
          {vapiError && (
            <div className="text-xs text-red-300 bg-red-500/10 rounded-lg p-2 border border-red-500/30 shrink-0">
              {vapiError}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <MeetingControls
        micOn={micOn}
        cameraOn={cameraOn}
        callStatus={callStatus}
        contextStatus={contextStatus}
        vapiClient={vapiClient}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onStartInterview={startInterview}
        onStopInterview={stopInterview}
        onRoundComplete={sessionId ? handleRoundComplete : undefined}
        showCompleteButton={!!sessionId}
      />

      {/* Code Editor (only for coding rounds) */}
      <InteractiveCodeEditor
        roundId={roundId || undefined}
        interviewId={interviewId || undefined}
        onCodeChange={handleCodeChange}
        isInterviewActive={callStatus === 'in-call'}
      />
    </div>
  );
};

export default Meeting;
