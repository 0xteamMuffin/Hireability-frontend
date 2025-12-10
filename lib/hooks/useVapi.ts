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
}

export const useVapi = ({ user }: UseVapiProps) => {
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
    const conversationRef = useRef<ConversationEntry[]>([]);

    const timeFormatter = useMemo(
        () => new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }),
        []
    );

    useEffect(() => {
        conversationRef.current = conversation;
    }, [conversation]);

    const persistTranscript = async (endedAt: Date) => {
        if (!user) return;
        if (!conversationRef.current.length) return;
        if (!interviewId) return;

        const startedAt = callStartedAt;
        const durationSeconds =
            startedAt != null ? Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)) : null;

        await vapiApi.saveTranscript({
            interviewId,
            assistantId: activeAssistantId,
            callId: null,
            startedAt: startedAt?.toISOString() || null,
            endedAt: endedAt.toISOString(),
            durationSeconds,
            transcript: conversationRef.current,
        });
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
            setCallStartedAt((prev) => prev || new Date());
        });

        client.on('call-end', () => {
            setCallStatus('idle');
            setIsSpeaking(false);
            const endedAt = new Date();
            persistTranscript(endedAt);
            setCallStartedAt(null);
            setActiveAssistantId(null);
            setInterviewId(null);
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
            const response = await vapiApi.getContext();
            if (response.success && response.data) {
                setContext(response.data);
                setContextStatus('idle');
            } else {
                setContextStatus('error');
                setVapiError(response.error || 'Failed to load interview context');
            }
        };

        loadContext();
    }, [user]);

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

        setCallStatus('connecting');

        try {
            const interviewResp = await vapiApi.startInterview({
                assistantId,
                contextPrompt: context?.prompt || null,
            });
            if (!interviewResp.success || !interviewResp.data) {
                setCallStatus('idle');
                setVapiError(interviewResp.error || 'Failed to start interview session');
                return;
            }
            setInterviewId(interviewResp.data.id);
            setCallStartedAt(new Date(interviewResp.data.startedAt));

            await vapiClient.start(assistantId, {
                variableValues: {
                    userId: user.id,
                    userContext: context?.prompt || null,
                },
            } as any);
        } catch (error) {
            setCallStatus('idle');
            setVapiError(error instanceof Error ? error.message : 'Failed to start the interview');
        }
    };

    const stopInterview = () => {
        vapiClient?.stop();
        setCallStatus('idle');
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