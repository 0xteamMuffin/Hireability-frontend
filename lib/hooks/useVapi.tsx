'use client';
/**
 * Enhanced VAPI Hook with real-time state sync
 * Handles VAPI voice calls with WebSocket integration for live interview state
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { vapiApi } from '@/lib/api';
import { VapiContext } from '@/lib/types';
import { useInterviewStore } from '@/lib/stores/interview-store';
import { useSocket } from './useSocket';
import { TranscriptEntry } from '@/lib/types/interview-state';

interface User {
  id: string;
}

interface UseVapiProps {
  user: User | null;
  targetId?: string | null;
  sessionId?: string | null;
  roundType?: string;
  getAverageExpressions?: () => Record<string, number>;
}

export interface ConversationEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

export const useVapi = ({
  user,
  targetId,
  sessionId,
  roundType,
  getAverageExpressions,
}: UseVapiProps) => {
  const [vapiClient, setVapiClient] = useState<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'in-call'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [contextStatus, setContextStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [context, setContext] = useState<VapiContext | null>(null);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [callStartedAt, setCallStartedAt] = useState<Date | null>(null);
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isCallEnding, setIsCallEnding] = useState(false);
  const [codingQuestionDetected, setCodingQuestionDetected] = useState<{
    question: string;
    conversation: ConversationEntry[];
  } | null>(null);

  const interviewIdRef = useRef<string | null>(null);
  const callIdRef = useRef<string | null>(null);
  const conversationRef = useRef<ConversationEntry[]>([]);
  const userRef = useRef<User | null>(user);
  const callStartedAtRef = useRef<Date | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const callEndResolveRef = useRef<(() => void) | null>(null);
  const codingQuestionTriggeredRef = useRef(false);
  const codingQuestionDetectedRef = useRef<{ question: string; conversation: ConversationEntry[] } | null>(null);

  const {
    addToTranscript,
    reset: resetInterviewStore,
    isConnected: socketConnected,
  } = useInterviewStore();

  const { emitExpressionUpdate, emitCodeUpdate } = useSocket({
    interviewId,
    userId: user?.id || null,
    enabled: !!interviewId,
  });

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }),
    [],
  );

  // Sync codingQuestionDetected to ref for use in callbacks
  useEffect(() => {
    codingQuestionDetectedRef.current = codingQuestionDetected;
    if (!codingQuestionDetected) {
      codingQuestionTriggeredRef.current = false;
    }
  }, [codingQuestionDetected]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);
  useEffect(() => {
    callStartedAtRef.current = callStartedAt;
  }, [callStartedAt]);
  useEffect(() => {
    activeAssistantIdRef.current = activeAssistantId;
  }, [activeAssistantId]);

  const persistTranscript = useCallback(async (endedAt: Date) => {
    const iid = interviewIdRef.current;
    const currentUser = userRef.current;
    const startedAt = callStartedAtRef.current;
    const assistantId = activeAssistantIdRef.current;
    const cid = callIdRef.current;

    console.log('[persistTranscript] start', {
      hasUser: !!currentUser,
      interviewId: iid,
      transcriptLines: conversationRef.current.length,
    });

    if (!currentUser || !conversationRef.current.length || !iid) return;

    const durationSeconds = startedAt
      ? Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000))
      : null;

    const resp = await vapiApi.saveTranscript({
      interviewId: iid,
      assistantId,
      callId: cid,
      startedAt: startedAt?.toISOString() || null,
      endedAt: endedAt.toISOString(),
      durationSeconds,
      transcript: conversationRef.current,
    });

    console.log('[persistTranscript] response', resp);
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!apiKey) {
      setVapiError('Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY');
      return;
    }

    const client = new Vapi(apiKey);
    setVapiClient(client);
    const clientAny = client as any;

    clientAny.on('call-start', (payload: any) => {
      console.log('[call-start] Event fired:', payload);
      setCallStatus('in-call');
      setVapiError(null);
      setConversation([]);

      const startTime = new Date();
      setCallStartedAt(startTime);
      callStartedAtRef.current = startTime;

      const eventCallId =
        payload?.id ||
        payload?.callId ||
        payload?.call?.id ||
        payload?.data?.id ||
        payload?.data?.callId ||
        null;

      if (eventCallId && !callIdRef.current) {
        setCallId(eventCallId);
        callIdRef.current = eventCallId;
      }
    });

    clientAny.on('call-end', async () => {
      console.log('[call-end] Event fired');
      
      // Check if we have a coding question detected - if so, don't do full cleanup
      // We need to preserve state for the modal
      if (codingQuestionDetectedRef.current) {
        console.log('[call-end] Coding question detected, skipping full cleanup to preserve state for modal');
        setIsCallEnding(false);
        setCallStatus('idle');
        setIsSpeaking(false);
        // Don't clear interviewId or other state - we need it for the modal
        return;
      }
      
      setIsCallEnding(true);
      setCallStatus('idle');
      setIsSpeaking(false);

      const endedAt = new Date();
      const currentInterviewId = interviewIdRef.current;
      const currentCallId = callIdRef.current;

      const cleanup = () => {
        setCallStartedAt(null);
        callStartedAtRef.current = null;
        setActiveAssistantId(null);
        activeAssistantIdRef.current = null;
        setInterviewId(null);
        interviewIdRef.current = null;
        setCallId(null);
        callIdRef.current = null;
        setIsCallEnding(false);

        if (callEndResolveRef.current) {
          callEndResolveRef.current();
          callEndResolveRef.current = null;
        }
      };

      if (!currentInterviewId) {
        cleanup();
        return;
      }

      let averageExpressions: Record<string, number> | undefined;
      if (getAverageExpressions) {
        try {
          averageExpressions = getAverageExpressions();
        } catch (err) {
          console.error('[call-end] Error getting expressions:', err);
        }
      }

      try {
        await persistTranscript(endedAt);

        if (currentCallId) {
          await vapiApi.saveCallMetadata({
            interviewId: currentInterviewId,
            callId: currentCallId,
            averageExpressions,
          });
        }
      } catch (err) {
        console.error('[call-end] Error:', err);
        setVapiError('Failed to save transcript');
      } finally {
        cleanup();
      }
    });

    client.on('speech-start', () => setIsSpeaking(true));
    client.on('speech-end', () => setIsSpeaking(false));

    client.on('message', (message: any) => {
      console.log('[useVapi] Message received:', {
        type: message.type,
        transcriptType: message.transcriptType,
        role: message.role,
        hasTranscript: !!message.transcript,
        transcriptLength: message.transcript?.length || 0,
        transcriptPreview: message.transcript?.substring(0, 100) || 'N/A',
      });

      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const entry: ConversationEntry = {
          role: message.role || 'assistant',
          text: message.transcript,
          timestamp: timeFormatter.format(new Date()),
          isFinal: true,
        };

        setConversation((prev) => [...prev, entry]);

        addToTranscript({
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.transcript,
          timestamp: new Date().toISOString(),
          type: 'general',
        });

        // Check for coding question trigger phrase in TECHNICAL rounds
        console.log('[useVapi] Checking coding question conditions:', {
          roundType,
          isTechnical: roundType === 'TECHNICAL',
          isAssistant: message.role === 'assistant',
          hasTranscript: !!message.transcript,
          alreadyDetected: !!codingQuestionDetected,
          willCheck: roundType === 'TECHNICAL' && message.role === 'assistant' && message.transcript && !codingQuestionDetected,
        });

        if (
          roundType === 'TECHNICAL' &&
          message.role === 'assistant' &&
          message.transcript &&
          !codingQuestionDetected
        ) {
          const transcript = message.transcript.toLowerCase();
          // Simplified trigger detection - look for "coding question" or "coding problem" in the message
          // This catches variations like "I'm gonna provide you with a coding question", "let me give you a coding question", etc.
          const codingQuestionKeywords = ['coding question', 'coding problem', 'coding challenge'];
          
          console.log('[useVapi] Analyzing transcript for coding question triggers:', {
            transcriptLength: transcript.length,
            transcriptPreview: transcript.substring(0, 200),
            keywords: codingQuestionKeywords,
          });
          
          // Check current message and recent conversation
          const allRecentMessages = [...conversationRef.current, entry];
          const recentText = allRecentMessages
            .filter((c) => c.role === 'assistant')
            .slice(-5) // Check last 5 assistant messages
            .map((c) => c.text.toLowerCase())
            .join(' ');

          console.log('[useVapi] Recent conversation context:', {
            totalMessages: allRecentMessages.length,
            assistantMessages: allRecentMessages.filter((c) => c.role === 'assistant').length,
            recentTextLength: recentText.length,
            recentTextPreview: recentText.substring(0, 200),
          });

          // Check if any coding question keywords appear in the transcript
          const hasTriggerInCurrent = codingQuestionKeywords.some(keyword => transcript.includes(keyword));
          const hasTriggerInRecent = codingQuestionKeywords.some(keyword => recentText.includes(keyword));
          const hasTrigger = hasTriggerInCurrent || hasTriggerInRecent;

          console.log('[useVapi] Trigger phrase check results:', {
            hasTriggerInCurrent,
            hasTriggerInRecent,
            hasTrigger,
            currentTranscriptContainsCodingQuestion: transcript.includes('coding question'),
            currentTranscriptContainsCodingProblem: transcript.includes('coding problem'),
            currentTranscriptContainsCodingChallenge: transcript.includes('coding challenge'),
            recentTextContainsCodingQuestion: recentText.includes('coding question'),
            recentTextContainsCodingProblem: recentText.includes('coding problem'),
            recentTextContainsCodingChallenge: recentText.includes('coding challenge'),
          });

          if (hasTrigger && !codingQuestionTriggeredRef.current) {
            codingQuestionTriggeredRef.current = true;
            console.log('[useVapi] ✅ Trigger phrase detected - ending call immediately and opening modal');
            
            // End the call FIRST, before setting state to ensure instant termination
            if (vapiClient) {
              vapiClient.stop();
              console.log('[useVapi] ✅ Call stopped immediately');
            } else {
              console.warn('[useVapi] ⚠️ vapiClient is null, cannot stop call');
            }
            
            // Store conversation for question generation (no question yet - will be generated from transcript)
            const allMessages = [...conversationRef.current, entry];
            
            setCodingQuestionDetected({
              question: '', // Empty - will be generated from transcript
              conversation: allMessages,
            });

            console.log('[useVapi] ✅ codingQuestionDetected state set, modal will open');
          } else if (hasTrigger && codingQuestionTriggeredRef.current) {
            console.log('[useVapi] Trigger already processed, skipping...');
          } else {
            console.log('[useVapi] No trigger phrase found in transcript or recent conversation');
          }
        } else {
          if (roundType !== 'TECHNICAL') {
            console.log('[useVapi] Skipping coding question check - not TECHNICAL round:', roundType);
          } else if (message.role !== 'assistant') {
            console.log('[useVapi] Skipping coding question check - not assistant message:', message.role);
          } else if (!message.transcript) {
            console.log('[useVapi] Skipping coding question check - no transcript');
          } else if (codingQuestionDetected) {
            console.log('[useVapi] Skipping coding question check - already detected');
          }
        }
      }
    });

    client.on('error', (error: any) => {
      setVapiError(error?.message || 'VAPI error');
      setCallStatus('idle');
    });

    return () => {
      client.stop();
    };
  }, [getAverageExpressions, timeFormatter, addToTranscript, persistTranscript]);

  useEffect(() => {
    if (!user) return;

    const loadContext = async () => {
      setContextStatus('loading');
      const response = await vapiApi.getContext(targetId || undefined, roundType || undefined);
      if (response.success && response.data) {
        setContext(response.data);
        setContextStatus('idle');
      } else {
        setContextStatus('error');
        setVapiError(response.error || 'Failed to load context');
      }
    };

    loadContext();
  }, [user, targetId, roundType]);

  const startInterview = useCallback(async () => {
    if (!user) {
      setVapiError('Please sign in to start the interview.');
      return;
    }

    if (!vapiClient) {
      setVapiError('Voice client not ready.');
      return;
    }

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      setVapiError('Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID');
      return;
    }

    setActiveAssistantId(assistantId);
    activeAssistantIdRef.current = assistantId;
    setCallStatus('connecting');

    resetInterviewStore();

    try {
      const interviewResp = await vapiApi.startInterview({
        assistantId,
        contextPrompt: context?.systemPrompt || null,
        sessionId: sessionId || undefined,
        roundType: roundType || undefined,
      });

      if (!interviewResp.success || !interviewResp.data) {
        setCallStatus('idle');
        setVapiError(interviewResp.error || 'Failed to start interview');
        return;
      }

      setInterviewId(interviewResp.data.id);
      interviewIdRef.current = interviewResp.data.id;

      const startTime = new Date(interviewResp.data.startedAt);
      setCallStartedAt(startTime);
      callStartedAtRef.current = startTime;

      const newInterviewId = interviewResp.data.id;
      setTimeout(async () => {
        try {
          const stateResp = await vapiApi.initializeInterviewState({
            userId: user.id,
            interviewId: newInterviewId,
            sessionId: sessionId || undefined,
            roundType: roundType || 'BEHAVIORAL',
            targetId: targetId || undefined,
          });
          console.log('[startInterview] Interview state initialized:', stateResp);
        } catch (stateErr) {
          console.warn('[startInterview] Failed to initialize state:', stateErr);
        }
      }, 500);

      const vapiCall = await vapiClient.start(assistantId, {
        model: {
          provider: 'google',
          model: 'gemini-2.5-flash-lite',
          toolIds: [
            'caa8e1cd-b9c7-473c-a69e-f445846f202d',
            'e022edd5-34b3-4671-af55-464cd947fbe4',
            '7ec95d93-6330-4329-8069-be07c566611b',
            '1e1f0237-f421-4b0b-b03a-dd046f10c335',
            'f709f0d0-4f0a-4cc2-878c-963d5176647a',
            '01665899-7776-46c0-ac9b-a3b33c26cc48',
            '7364a03c-a7a9-477e-a9a0-eebf40f78095',
            'c71cf8bc-9777-4137-a6fc-22b3c26ffdaa',
            '52f1d743-8a30-4ab6-976d-830945d731f9',
            '3f389918-4308-4b65-80d2-2502f4f5bcbc',
          ],
          messages: [
            {
              role: 'system',
              content: context?.systemPrompt,
            },
          ],
        },
        firstMessage: context?.firstMessage,
        variableValues: {
          userId: user.id,
          interviewId: interviewResp.data.id,
          roundType: roundType || 'BEHAVIORAL',
          targetId: targetId || '',
          sessionId: sessionId || '',
          userContext: context?.systemPrompt || null,
        },
      } as any);

      if (vapiCall?.id) {
        setCallId(vapiCall.id);
        callIdRef.current = vapiCall.id;
      }
    } catch (error) {
      console.error('[startInterview] Error:', error);
      setCallStatus('idle');
      setVapiError(error instanceof Error ? error.message : 'Failed to start interview');
    }
  }, [user, vapiClient, context, sessionId, roundType, targetId, resetInterviewStore]);

  const stopInterview = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      callEndResolveRef.current = resolve;

      const timeout = setTimeout(() => {
        callEndResolveRef.current = null;
        setCallStatus('idle');
        setIsCallEnding(false);
        resolve();
      }, 15000);

      const originalResolve = callEndResolveRef.current;
      callEndResolveRef.current = () => {
        clearTimeout(timeout);
        originalResolve?.();
      };

      try {
        vapiClient?.stop();
      } catch (err) {
        console.error('[stopInterview] Error:', err);
        clearTimeout(timeout);
        callEndResolveRef.current = null;
        setCallStatus('idle');
        setIsCallEnding(false);
        resolve();
      }
    });
  }, [vapiClient]);

  const handleExpressionUpdate = useCallback(
    (expressions: Record<string, number>) => {
      if (socketConnected && interviewId) {
        emitExpressionUpdate(expressions);
      }
    },
    [socketConnected, interviewId, emitExpressionUpdate],
  );

  const handleCodeUpdate = useCallback(
    (code: string, language: string) => {
      if (socketConnected && interviewId) {
        emitCodeUpdate(code, language);
      }
    },
    [socketConnected, interviewId, emitCodeUpdate],
  );

  const startInterviewWithContext = useCallback(
    async (contextOverride?: { systemPrompt: string; firstMessage: string }) => {
      if (!user) {
        setVapiError('Please sign in to start the interview.');
        return;
      }

      if (!vapiClient) {
        setVapiError('Voice client not ready.');
        return;
      }

      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!assistantId) {
        setVapiError('Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID');
        return;
      }

      setActiveAssistantId(assistantId);
      activeAssistantIdRef.current = assistantId;
      setCallStatus('connecting');
      
      console.log('[startInterviewWithContext] Starting interview with context override:', {
        hasContextOverride: !!contextOverride,
        systemPromptLength: contextOverride?.systemPrompt?.length || 0,
        systemPromptPreview: contextOverride?.systemPrompt?.substring(0, 300) || 'N/A',
        firstMessagePreview: contextOverride?.firstMessage?.substring(0, 100) || 'N/A',
      });

      try {
        const systemPrompt = contextOverride?.systemPrompt || context?.systemPrompt || null;
        const firstMessage = contextOverride?.firstMessage || context?.firstMessage || null;

        console.log('[startInterviewWithContext] Using system prompt:', {
          source: contextOverride ? 'contextOverride (resuming)' : 'context (new)',
          systemPromptLength: systemPrompt?.length || 0,
          hasFirstMessage: !!firstMessage,
          firstMessagePreview: firstMessage?.substring(0, 100) || 'N/A',
        });

        const interviewResp = await vapiApi.startInterview({
          assistantId,
          contextPrompt: systemPrompt,
          sessionId: sessionId || undefined,
          roundType: roundType || undefined,
        });

        if (!interviewResp.success || !interviewResp.data) {
          setCallStatus('idle');
          setVapiError(interviewResp.error || 'Failed to start interview');
          return;
        }

        setInterviewId(interviewResp.data.id);
        interviewIdRef.current = interviewResp.data.id;

        const startTime = new Date(interviewResp.data.startedAt);
        setCallStartedAt(startTime);
        callStartedAtRef.current = startTime;

        const newInterviewId = interviewResp.data.id;
        
        // Only initialize state if this is a NEW interview, not a resume
        // When resuming, we want to keep the existing state with the conversation history
        if (!contextOverride) {
          setTimeout(async () => {
            try {
              const stateResp = await vapiApi.initializeInterviewState({
                userId: user.id,
                interviewId: newInterviewId,
                sessionId: sessionId || undefined,
                roundType: roundType || 'BEHAVIORAL',
                targetId: targetId || undefined,
              });
              console.log('[startInterviewWithContext] Interview state initialized:', stateResp);
            } catch (stateErr) {
              console.warn('[startInterviewWithContext] Failed to initialize state:', stateErr);
            }
          }, 500);
        } else {
          console.log('[startInterviewWithContext] Skipping state initialization - resuming with continuation context');
        }

        console.log('[startInterviewWithContext] Starting VAPI call with system prompt:', {
          systemPromptLength: systemPrompt?.length || 0,
          systemPromptContainsContinuation: systemPrompt?.includes('CONTINUATION CONTEXT') || false,
          systemPromptContainsEvaluation: systemPrompt?.includes('Coding Question Evaluation') || false,
          firstMessage: firstMessage?.substring(0, 150) || 'N/A',
        });

        const vapiCall = await vapiClient.start(assistantId, {
          model: {
            provider: 'google',
            model: 'gemini-2.5-flash-lite',
            toolIds: [
              'caa8e1cd-b9c7-473c-a69e-f445846f202d',
              'e022edd5-34b3-4671-af55-464cd947fbe4',
              '7ec95d93-6330-4329-8069-be07c566611b',
              '1e1f0237-f421-4b0b-b03a-dd046f10c335',
              'f709f0d0-4f0a-4cc2-878c-963d5176647a',
              '01665899-7776-46c0-ac9b-a3b33c26cc48',
              '7364a03c-a7a9-477e-a9a0-eebf40f78095',
              'c71cf8bc-9777-4137-a6fc-22b3c26ffdaa',
              '52f1d743-8a30-4ab6-976d-830945d731f9',
              '3f389918-4308-4b65-80d2-2502f4f5bcbc',
            ],
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
            ],
          },
          firstMessage: firstMessage,
          variableValues: {
            userId: user.id,
            interviewId: interviewResp.data.id,
            roundType: roundType || 'BEHAVIORAL',
            targetId: targetId || '',
            sessionId: sessionId || '',
            userContext: systemPrompt || null,
          },
        } as any);

        console.log('[startInterviewWithContext] VAPI call started successfully:', {
          callId: vapiCall?.id,
          hasSystemPrompt: !!systemPrompt,
          hasFirstMessage: !!firstMessage,
        });

        if (vapiCall?.id) {
          setCallId(vapiCall.id);
          callIdRef.current = vapiCall.id;
        }
      } catch (error) {
        console.error('[startInterviewWithContext] Error:', error);
        setCallStatus('idle');
        setVapiError(error instanceof Error ? error.message : 'Failed to start interview');
      }
    },
    [user, vapiClient, context, sessionId, roundType, targetId],
  );

  return {
    vapiClient,
    callStatus,
    isSpeaking,
    vapiError,
    contextStatus,
    context,
    conversation,
    isCallEnding,
    interviewId,
    codingQuestionDetected,
    setCodingQuestionDetected,

    startInterview,
    startInterviewWithContext,
    stopInterview,

    socketConnected,
    emitExpressionUpdate: handleExpressionUpdate,
    emitCodeUpdate: handleCodeUpdate,
  };
};
