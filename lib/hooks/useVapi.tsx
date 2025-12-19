"use client"
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

export const useVapi = ({ user, targetId, sessionId, roundType, getAverageExpressions }: UseVapiProps) => {
    // VAPI state
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

    // Refs for accessing latest values in callbacks
    const interviewIdRef = useRef<string | null>(null);
    const callIdRef = useRef<string | null>(null);
    const conversationRef = useRef<ConversationEntry[]>([]);
    const userRef = useRef<User | null>(user);
    const callStartedAtRef = useRef<Date | null>(null);
    const activeAssistantIdRef = useRef<string | null>(null);
    const callEndResolveRef = useRef<(() => void) | null>(null);

    // Interview store for real-time state
    const {
        addToTranscript,
        reset: resetInterviewStore,
        isConnected: socketConnected,
    } = useInterviewStore();

    // Socket connection for real-time updates
    // Connect as soon as we have an interviewId (not just when in-call)
    const { emitExpressionUpdate, emitCodeUpdate } = useSocket({
        interviewId,
        userId: user?.id || null,
        enabled: !!interviewId,
    });

    const timeFormatter = useMemo(
        () => new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }),
        []
    );

    // Keep refs in sync
    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { conversationRef.current = conversation; }, [conversation]);
    useEffect(() => { callStartedAtRef.current = callStartedAt; }, [callStartedAt]);
    useEffect(() => { activeAssistantIdRef.current = activeAssistantId; }, [activeAssistantId]);

    // Persist transcript to backend
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

    // Initialize VAPI client
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        if (!apiKey) {
            setVapiError('Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY');
            return;
        }

        const client = new Vapi(apiKey);
        setVapiClient(client);
        const clientAny = client as any;

        // Call started
        clientAny.on('call-start', (payload: any) => {
            console.log('[call-start] Event fired:', payload);
            setCallStatus('in-call');
            setVapiError(null);
            setConversation([]);

            const startTime = new Date();
            setCallStartedAt(startTime);
            callStartedAtRef.current = startTime;

            // Extract call ID from various payload locations
            const eventCallId = payload?.id || payload?.callId || payload?.call?.id ||
                payload?.data?.id || payload?.data?.callId || null;

            if (eventCallId && !callIdRef.current) {
                setCallId(eventCallId);
                callIdRef.current = eventCallId;
            }
        });

        // Call ended
        clientAny.on('call-end', async () => {
            console.log('[call-end] Event fired');
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

            // Get expressions
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

        // Speech events
        client.on('speech-start', () => setIsSpeaking(true));
        client.on('speech-end', () => setIsSpeaking(false));

        // Transcript messages
        client.on('message', (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const entry: ConversationEntry = {
                    role: message.role || 'assistant',
                    text: message.transcript,
                    timestamp: timeFormatter.format(new Date()),
                    isFinal: true,
                };

                setConversation((prev) => [...prev, entry]);

                // Also add to interview store transcript
                addToTranscript({
                    role: message.role === 'user' ? 'user' : 'assistant',
                    content: message.transcript,
                    timestamp: new Date().toISOString(),
                    type: 'general',
                });
            }
        });

        // Error handling
        client.on('error', (error: any) => {
            setVapiError(error?.message || 'VAPI error');
            setCallStatus('idle');
        });

        return () => {
            client.stop();
        };
    }, [getAverageExpressions, timeFormatter, addToTranscript, persistTranscript]);

    // Load context
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

    // Start interview
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

        // Reset interview store for fresh start
        resetInterviewStore();

        try {
            // Create interview session on backend
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

            // Initialize interview state for real-time sync
            // Add a small delay to allow socket to connect first
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
            }, 500); // Give socket time to connect and join room

            // Start VAPI call with enhanced variable values for tools
            const vapiCall = await vapiClient.start(assistantId, {
                model: {
                    provider: 'google',
                    model: 'gemini-2.5-flash-lite',
                    toolIds: [
                        "caa8e1cd-b9c7-473c-a69e-f445846f202d",
                        "e022edd5-34b3-4671-af55-464cd947fbe4",
                        "7ec95d93-6330-4329-8069-be07c566611b",
                        "1e1f0237-f421-4b0b-b03a-dd046f10c335",
                        "f709f0d0-4f0a-4cc2-878c-963d5176647a",
                        "01665899-7776-46c0-ac9b-a3b33c26cc48",
                        "7364a03c-a7a9-477e-a9a0-eebf40f78095",
                        "c71cf8bc-9777-4137-a6fc-22b3c26ffdaa",
                        "52f1d743-8a30-4ab6-976d-830945d731f9",
                        "3f389918-4308-4b65-80d2-2502f4f5bcbc"
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

    // Stop interview
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

    // Emit expression updates through socket
    const handleExpressionUpdate = useCallback((expressions: Record<string, number>) => {
        if (socketConnected && interviewId) {
            emitExpressionUpdate(expressions);
        }
    }, [socketConnected, interviewId, emitExpressionUpdate]);

    // Emit code updates through socket
    const handleCodeUpdate = useCallback((code: string, language: string) => {
        if (socketConnected && interviewId) {
            emitCodeUpdate(code, language);
        }
    }, [socketConnected, interviewId, emitCodeUpdate]);

    return {
        // VAPI state
        vapiClient,
        callStatus,
        isSpeaking,
        vapiError,
        contextStatus,
        context,
        conversation,
        isCallEnding,
        interviewId,

        // Actions
        startInterview,
        stopInterview,

        // Socket-related
        socketConnected,
        emitExpressionUpdate: handleExpressionUpdate,
        emitCodeUpdate: handleCodeUpdate,
    };
};
