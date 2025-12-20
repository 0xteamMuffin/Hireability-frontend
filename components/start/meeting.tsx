/**
 * Meeting Component - Unified Interview Experience
 * Single, clean interface - just video + transcript
 */

'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertCircle, Loader2, Radio, Wifi, WifiOff, TrendingUp } from 'lucide-react';
import MeetingVideo from './meeting-video';
import { useAuth, useVapi } from '@/lib/hooks';
import Transcriber from './transcriber';
import VapiOrb from './ui/vapi-orb';
import MeetingControls from './ui/metting-controls';
import { useSearchParams, useRouter } from 'next/navigation';
import InteractiveCodeEditor from './interactive-code-editor';
import { useInterviewStore, selectIsCodingPhase } from '@/lib/stores/interview-store';
import { RoundType as OldRoundType, ROUND_DISPLAY_INFO } from '@/lib/types';
import { sessionApi } from '@/lib/api';
import CodingQuestionModal from './coding-question-modal';

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

  const lastInterviewIdRef = useRef<string | null>(null);

  const {
    isConnected: socketConnected,
    interviewState,
    codingProblem,
    isCodeEditorOpen,
    setCodeEditorOpen,
    reset: resetStore,
  } = useInterviewStore();

  const isCodingPhase = useInterviewStore(selectIsCodingPhase);

  const expressionDataRef = useRef<Record<string, number[]>>({
    angry: [],
    sad: [],
    happy: [],
    neutral: [],
    surprised: [],
    fearful: [],
    disgusted: [],
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
      angry: [],
      sad: [],
      happy: [],
      neutral: [],
      surprised: [],
      fearful: [],
      disgusted: [],
    };
    return averages;
  }, []);

  const {
    vapiClient,
    callStatus,
    isSpeaking,
    vapiError,
    contextStatus,
    context,
    conversation,
    startInterview,
    startInterviewWithContext,
    stopInterview,
    isCallEnding,
    interviewId,
    codingQuestionDetected,
    setCodingQuestionDetected,
    emitExpressionUpdate,
    emitCodeUpdate,
  } = useVapi({
    user,
    targetId,
    sessionId,
    roundType: roundType || undefined,
    getAverageExpressions,
  });

  const [showCodingModal, setShowCodingModal] = useState(false);

  useEffect(() => {
    if (interviewId) {
      lastInterviewIdRef.current = interviewId;
    }
  }, [interviewId]);

  const currentTime = useTime();

  const toggleMic = () => setMicOn((prev) => !prev);
  const toggleCamera = () => setCameraOn((prev) => !prev);

  const handleRoundComplete = async () => {
    if (!sessionId || !roundId) {
      router.push('/dashboard/analytics');
      return;
    }

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

  const handleExpressionChange = useCallback(
    (expressions: Record<string, number>) => {
      Object.entries(expressions).forEach(([emotion, value]) => {
        if (emotion in expressionDataRef.current) {
          expressionDataRef.current[emotion].push(value);
        }
      });
      emitExpressionUpdate(expressions);
    },
    [emitExpressionUpdate],
  );

  const handleCodeChange = useCallback(
    (code: string, language: string) => {
      emitCodeUpdate(code, language);
    },
    [emitCodeUpdate],
  );

  useEffect(() => {
    if (
      vapiClient &&
      callStatus === 'idle' &&
      contextStatus !== 'loading' &&
      !vapiError &&
      !hasStartedRef.current &&
      !codingQuestionDetected
    ) {
      hasStartedRef.current = true;
      startInterview();
    }
  }, [vapiClient, callStatus, contextStatus, vapiError, startInterview, codingQuestionDetected]);

  useEffect(() => {
    console.log('[Meeting] codingQuestionDetected changed:', {
      hasCodingQuestion: !!codingQuestionDetected,
      questionPreview: codingQuestionDetected?.question?.substring(0, 100) || 'N/A',
      conversationLength: codingQuestionDetected?.conversation?.length || 0,
      currentShowCodingModal: showCodingModal,
    });

    if (codingQuestionDetected) {
      console.log('[Meeting] Coding question detected, opening modal:', {
        question: codingQuestionDetected.question.substring(0, 100),
        conversationLength: codingQuestionDetected.conversation.length,
      });
      
      // Ensure call is ended immediately when modal opens (backup safety check)
      if (vapiClient && callStatus === 'in-call') {
        console.log('[Meeting] Ensuring call is ended as modal opens');
        vapiClient.stop();
      }
      
      setShowCodingModal(true);
      console.log('[Meeting] ✅ showCodingModal set to true');
    } else {
      console.log('[Meeting] No coding question detected, modal should remain closed');
    }
  }, [codingQuestionDetected, showCodingModal, vapiClient, callStatus]);

  // Track when showCodingModal changes
  useEffect(() => {
    console.log('[Meeting] showCodingModal state changed:', {
      showCodingModal,
      hasCodingQuestion: !!codingQuestionDetected,
      modalShouldRender: codingQuestionDetected && showCodingModal,
    });
  }, [showCodingModal, codingQuestionDetected]);

  const handleResumeCall = useCallback(
    async (resumeContext: { systemPrompt: string; firstMessage: string }) => {
      setCodingQuestionDetected(null);
      setShowCodingModal(false);
      hasStartedRef.current = false;

      // Wait for call to fully end, then start new one
      setTimeout(async () => {
        if (vapiClient && resumeContext) {
          await startInterviewWithContext(resumeContext);
        }
      }, 2000);
    },
    [vapiClient, startInterviewWithContext, setCodingQuestionDetected],
  );

  useEffect(() => {
    return () => {
      resetStore();
      lastInterviewIdRef.current = null;
    };
  }, [resetStore]);

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

  useEffect(() => {
    if (isCodingPhase && codingProblem && !isCodeEditorOpen) {
      setCodeEditorOpen(true);
    }
  }, [isCodingPhase, codingProblem, isCodeEditorOpen, setCodeEditorOpen]);

  if (permissionError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#202124] p-4 text-center text-white">
        <div className="mb-6 rounded-full bg-red-500/20 p-5">
          <AlertCircle size={64} className="text-red-400" />
        </div>
        <h1 className="mb-3 text-2xl font-medium">Camera or Mic Blocked</h1>
        <p className="mb-8 max-w-md text-gray-300">{permissionError}</p>
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#3c4043] p-6 text-left text-gray-200">
          <p className="mb-4 font-bold text-white">How to enable access:</p>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>Click the Lock icon in your address bar</li>
            <li>Allow Camera and Microphone access</li>
            <li>Click refresh below</li>
          </ol>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-blue-500 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (isCallEnding) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#202124] text-white">
        <Loader2 size={48} className="mb-4 animate-spin text-green-400" />
        <p className="text-lg text-white/80">Saving your interview...</p>
        <p className="mt-2 text-sm text-white/60">Please wait while we analyze your session</p>
      </div>
    );
  }

  if (callStatus !== 'in-call') {
    // Show modal if coding question is detected, even if call is not active
    if (codingQuestionDetected && showCodingModal) {
      // Render the modal on a dark background
      return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#202124] text-white">
          {codingQuestionDetected && showCodingModal && (
            <CodingQuestionModal
              isOpen={showCodingModal}
              onClose={() => {
                console.log('[Meeting] Closing coding modal');
                setShowCodingModal(false);
                setCodingQuestionDetected(null);
              }}
              question={codingQuestionDetected.question}
              interviewId={interviewId || ''}
              previousSystemPrompt={context?.systemPrompt || ''}
              previousConversation={codingQuestionDetected.conversation.map((c) => ({
                role: c.role,
                content: c.text,
              }))}
              onResumeCall={handleResumeCall}
            />
          )}
        </div>
      );
    }
    
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#202124] text-white">
        <Loader2 size={48} className="mb-4 animate-spin text-indigo-400" />
        <p className="text-lg text-white/80">Connecting to interview...</p>
        {vapiError && <p className="mt-2 px-4 text-center text-sm text-red-400">{vapiError}</p>}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#202124] text-white">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
              socketConnected
                ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                : 'border border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
            }`}
          >
            {socketConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{socketConnected ? 'Connected' : 'Connecting...'}</span>
          </div>

          {/* Round type */}
          {roundType && (
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">
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
      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        {/* Main Video Area */}
        <div className="relative flex min-h-[40vh] flex-1 items-center justify-center overflow-hidden rounded-2xl bg-[#3c4043] ring-1 ring-white/10 lg:min-h-0">
          <VapiOrb isSpeaking={isSpeaking} orbScale={orbScale} />

          <div className="absolute bottom-4 left-4 rounded-lg border border-white/5 bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Radio
                size={12}
                className={isSpeaking ? 'animate-pulse text-green-400' : 'text-white/60'}
              />
              <span>AI Interviewer</span>
              {isSpeaking && <span className="text-xs text-green-400">Speaking...</span>}
            </div>
          </div>

          {/* User Video */}
          <div className="absolute right-4 bottom-4 h-28 w-40 md:right-8 md:bottom-8 md:h-36 md:w-56">
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
        <div className="flex max-h-[45vh] w-full shrink-0 flex-col gap-3 overflow-hidden lg:max-h-full lg:w-[380px]">
          {/* Status */}
          <div className="shrink-0 rounded-xl bg-[#2a2d32] p-3 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">
                  {context?.profile?.targetRole || 'Interview'}
                  {context?.profile?.targetCompany && ` @ ${context.profile.targetCompany}`}
                </p>
              </div>
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                  isSpeaking
                    ? 'border-green-500/20 bg-green-500/10 text-green-300'
                    : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
                }`}
              >
                <Radio size={12} className={isSpeaking ? 'animate-pulse' : ''} />
                {isSpeaking ? 'Speaking' : 'Listening'}
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-[#2a2d32] ring-1 ring-white/10">
            <Transcriber conversation={conversation} />
          </div>

          {/* Error display */}
          {vapiError && (
            <div className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
              {vapiError}
            </div>
          )}
        </div>
      </div>

      {/* Coding Question Modal */}
      {codingQuestionDetected && showCodingModal && (
        <CodingQuestionModal
          isOpen={showCodingModal}
          onClose={() => {
            console.log('[Meeting] Closing coding modal');
            setShowCodingModal(false);
            setCodingQuestionDetected(null);
          }}
          question={codingQuestionDetected.question}
          interviewId={interviewId || ''}
          previousSystemPrompt={context?.systemPrompt || ''}
          previousConversation={codingQuestionDetected.conversation.map((c) => ({
            role: c.role,
            content: c.text,
          }))}
          onResumeCall={handleResumeCall}
        />
      )}

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
