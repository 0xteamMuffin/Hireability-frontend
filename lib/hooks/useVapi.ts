import { useState, useEffect, useRef, useMemo } from 'react';
import Vapi from '@vapi-ai/web';
import { vapiApi } from '@/lib/api';
import { VapiContext } from '@/lib/types';
import { ConversationEntry } from '@/components/start/transcriber';

interface User {
    id: string;
}

interface UseVapiProps {
    user: User | null;
    targetId?: string | null;
    roundType?: string;
    getAverageExpressions?: () => Record<string, number>;
}

export const useVapi = ({ user, targetId, roundType, getAverageExpressions }: UseVapiProps) => {
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
    const interviewIdRef = useRef<string | null>(null);
    const callIdRef = useRef<string | null>(null);
    const conversationRef = useRef<ConversationEntry[]>([]);
    const userRef = useRef<User | null>(user);
    const callStartedAtRef = useRef<Date | null>(null);
    const activeAssistantIdRef = useRef<string | null>(null);
    const callEndResolveRef = useRef<(() => void) | null>(null);

    const timeFormatter = useMemo(
        () => new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }),
        []
    );

    // Keep refs in sync with state/props
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

    const persistTranscript = async (endedAt: Date) => {
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

        if (!currentUser) return;
        if (!conversationRef.current.length) return;
        if (!iid) return;

        const durationSeconds =
            startedAt != null ? Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)) : null;

        const resp = await vapiApi.saveTranscript({
            interviewId: iid,
            assistantId: assistantId,
            callId: cid,
            startedAt: startedAt?.toISOString() || null,
            endedAt: endedAt.toISOString(),
            durationSeconds,
            transcript: conversationRef.current,
        });

        console.log('[persistTranscript] response', resp);
    };

    // Initialize Vapi client
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        if (!apiKey) {
            setVapiError('Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variable');
            return;
        }

        const client = new Vapi(apiKey);
        setVapiClient(client);

        const clientAny = client as any;

        clientAny.on('call-start', (payload: any) => {
            console.log('[call-start] ======= EVENT FIRED =======');
            console.log('[call-start] Full payload:', JSON.stringify(payload, null, 2));

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

            console.log('[call-start] Extracted callId from event:', eventCallId);

            if (eventCallId && !callIdRef.current) {
                console.log('[call-start] ✅ Setting callId from event');
                setCallId(eventCallId);
                callIdRef.current = eventCallId;
            } else if (!eventCallId && !callIdRef.current) {
                console.warn('[call-start] ⚠️ No callId available from either source!');
            } else {
                console.log('[call-start] Using existing callId:', callIdRef.current);
            }

            console.log('[call-start] ======= END EVENT =======');
        });

        clientAny.on('call-end', async () => {
            console.log('[call-end] fired', { interviewId: interviewIdRef.current, callId: callIdRef.current });
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
                // Resolve the promise so stopInterview knows we're done
                if (callEndResolveRef.current) {
                    callEndResolveRef.current();
                    callEndResolveRef.current = null;
                }
            };

            if (!currentInterviewId) {
                console.warn('[call-end] missing interviewId, skipping persist');
                cleanup();
                return;
            }

            // Get average expressions from parent
            let averageExpressions: Record<string, number> | undefined = undefined;
            if (getAverageExpressions) {
                try {
                    averageExpressions = getAverageExpressions();
                    console.log('[call-end] Average expressions:', averageExpressions);
                } catch (err) {
                    console.error('[call-end] error getting expressions:', err);
                }
            }

            try {
                // Save transcript first
                await persistTranscript(endedAt);

                // Persist call metadata - await this one as it's essential
                if (currentCallId) {
                    try {
                        await vapiApi.saveCallMetadata({
                            interviewId: currentInterviewId,
                            callId: currentCallId,
                            averageExpressions: averageExpressions,
                        });
                        console.log('[call-end] saveCallMetadata success - backend will auto-analyze');
                    } catch (err) {
                        console.error('[call-end] saveCallMetadata error:', err);
                    }
                }

                console.log('[call-end] essential operations completed');
            } catch (err) {
                console.error('Failed to save transcript', err);
                setVapiError('Failed to save transcript');
            } finally {
                cleanup();
            }
        });

        client.on('speech-start', () => setIsSpeaking(true));
        client.on('speech-end', () => setIsSpeaking(false));

        client.on('message', (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setConversation((prev) => [
                    ...prev,
                    {
                        role: message.role || 'assistant',
                        text: message.transcript,
                        timestamp: timeFormatter.format(new Date()),
                        isFinal: true,
                    },
                ]);
            }
        });

        client.on('error', (error: any) => {
            setVapiError(error?.message || 'Vapi error');
            setCallStatus('idle');
        });

        return () => {
            client.stop();
        };
    }, [getAverageExpressions, timeFormatter]);

    // Load context
    useEffect(() => {
        if (!user) return;

        const loadContext = async () => {
            setContextStatus('loading');
            const response = await vapiApi.getContext(targetId || undefined);
            if (response.success && response.data) {
                setContext(response.data);
                setContextStatus('idle');
            } else {
                setContextStatus('error');
                setVapiError(response.error || 'Failed to load interview context');
            }
        };

        loadContext();
    }, [user, targetId]);

    const startInterview = async () => {
        if (!user) {
            setVapiError('Please sign in to start the interview.');
            return;
        }

        if (!vapiClient) {
            setVapiError('Voice client is not ready yet.');
            return;
        }

        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
        if (!assistantId) {
            setVapiError('Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID environment variable');
            return;
        }
        setActiveAssistantId(assistantId);
        activeAssistantIdRef.current = assistantId;

        setCallStatus('connecting');

        try {
            const interviewResp = await vapiApi.startInterview({
                assistantId,
                contextPrompt: context?.systemPrompt || null,
            });
            if (!interviewResp.success || !interviewResp.data) {
                setCallStatus('idle');
                setVapiError(interviewResp.error || 'Failed to start interview session');
                return;
            }
            console.log('[startInterview] resp', interviewResp);
            setInterviewId(interviewResp.data.id);
            interviewIdRef.current = interviewResp.data.id;
            const startTime = new Date(interviewResp.data.startedAt);
            setCallStartedAt(startTime);
            callStartedAtRef.current = startTime;

            // START THE CALL AND GET THE CALL OBJECT
            console.log('[startInterview] Starting Vapi call...');
            const vapiCall = await vapiClient.start(assistantId, {
                model: {
                    provider: 'openai',
                    model: 'gpt-4o',
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
                    userContext: context?.systemPrompt || null,
                },
            } as any);

            console.log('[startInterview] Vapi call started:', vapiCall);

            if (vapiCall && vapiCall.id) {
                console.log('[startInterview] ✅ Got callId from vapi.start():', vapiCall.id);
                setCallId(vapiCall.id);
                callIdRef.current = vapiCall.id;
            } else if (vapiCall && (vapiCall as any).webCallUrl) {
                console.warn('[startInterview] This is a web call, checking for ID in different location');
                const webCallId = extractCallIdFromUrl((vapiCall as any).webCallUrl);
                if (webCallId) {
                    console.log('[startInterview] ✅ Extracted callId from webCallUrl:', webCallId);
                    setCallId(webCallId);
                    callIdRef.current = webCallId;
                }
            } else {
                console.warn('[startInterview] ⚠️ No callId returned from vapi.start()');
                console.log('[startInterview] Call object:', JSON.stringify(vapiCall, null, 2));
            }
        } catch (error) {
            console.error('[startInterview] Error:', error);
            setCallStatus('idle');
            setVapiError(error instanceof Error ? error.message : 'Failed to start the interview');
        }
    };

    const extractCallIdFromUrl = (url: string): string | null => {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            return pathParts[pathParts.length - 1] || null;
        } catch {
            return null;
        }
    };

    const stopInterview = async (): Promise<void> => {
        return new Promise((resolve) => {
            // Store the resolve function so call-end handler can call it
            callEndResolveRef.current = resolve;
            
            // Set a timeout in case call-end never fires
            const timeout = setTimeout(() => {
                console.warn('[stopInterview] timeout waiting for call-end');
                callEndResolveRef.current = null;
                setCallStatus('idle');
                setIsCallEnding(false);
                resolve();
            }, 15000); // 15 second timeout

            // Override resolve to also clear timeout
            const originalResolve = callEndResolveRef.current;
            callEndResolveRef.current = () => {
                clearTimeout(timeout);
                originalResolve?.();
            };

            try {
                vapiClient?.stop();
            } catch (err) {
                console.error('[stopInterview] error stopping client:', err);
                clearTimeout(timeout);
                callEndResolveRef.current = null;
                setCallStatus('idle');
                setIsCallEnding(false);
                resolve();
            }
        });
    };

    return {
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
    };
};