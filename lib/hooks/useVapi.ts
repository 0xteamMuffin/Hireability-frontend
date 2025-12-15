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
}

export const useVapi = ({ user, targetId }: UseVapiProps) => {
    const [vapiClient, setVapiClient] = useState<Vapi | null>(null);
    const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'in-call'>('idle');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [vapiError, setVapiError] = useState<string | null>(null);
    const [contextStatus, setContextStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [context, setContext] = useState<VapiContext | null>(null);
    const [conversation, setConversation] = useState<ConversationEntry[]>([]);
    const [callStartedAt, setCallStartedAt] = useState<Date | null>(null);
    const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null);
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const interviewIdRef = useRef<string | null>(null);
    const conversationRef = useRef<ConversationEntry[]>([]);
    const userRef = useRef<User | null>(user);
    const callStartedAtRef = useRef<Date | null>(null);
    const activeAssistantIdRef = useRef<string | null>(null);

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
            callId: null,
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

        client.on('call-start', () => {
            setCallStatus('in-call');
            setVapiError(null);
            setConversation([]);
            const startTime = new Date();
            setCallStartedAt(startTime);
            callStartedAtRef.current = startTime;
        });

        client.on('call-end', async () => {
            console.log('[call-end] fired', { interviewId: interviewIdRef.current });
            setCallStatus('idle');
            setIsSpeaking(false);
            const endedAt = new Date();

            const currentInterviewId = interviewIdRef.current;

            if (!currentInterviewId) {
                console.warn('[call-end] missing interviewId, skipping persist');
                setCallStartedAt(null);
                callStartedAtRef.current = null;
                setActiveAssistantId(null);
                activeAssistantIdRef.current = null;
                setInterviewId(null);
                interviewIdRef.current = null;
                return;
            }

            try {
                await persistTranscript(endedAt);
                
                // Automatically trigger analysis after saving transcript
                console.log('[call-end] triggering automatic analysis for interview:', currentInterviewId);
                vapiApi.analyzeInterview(currentInterviewId)
                    .then((resp) => {
                        if (resp.success) {
                            console.log('[call-end] analysis completed successfully');
                        } else {
                            console.warn('[call-end] analysis failed:', resp.error);
                        }
                    })
                    .catch((err) => {
                        console.error('[call-end] analysis error:', err);
                    });
            } catch (err) {
                console.error('Failed to save transcript', err);
                setVapiError('Failed to save transcript');
            } finally {
                setCallStartedAt(null);
                callStartedAtRef.current = null;
                setActiveAssistantId(null);
                activeAssistantIdRef.current = null;
                setInterviewId(null);
                interviewIdRef.current = null;
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
    }, []);

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

            await vapiClient.start(assistantId, {
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
        } catch (error) {
            setCallStatus('idle');
            setVapiError(error instanceof Error ? error.message : 'Failed to start the interview');
        }
    };

    const stopInterview = async () => {
        try {
            await vapiClient?.stop();
        } finally {
            setCallStatus('idle');
        }
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
    };
};