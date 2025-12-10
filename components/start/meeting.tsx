"use client"
import React, { useEffect, useState, useMemo } from 'react';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    AlertCircle,
    Loader2,
    Radio,
} from 'lucide-react';
import Link from 'next/link';
import Vapi from '@vapi-ai/web';
import MeetingVideo from './meeting-video';
import { useAuth } from '@/lib/hooks';
import { vapiApi } from '@/lib/api';
import { VapiContext } from '@/lib/types';
import Transcriber, { type ConversationEntry } from './transcriber';

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
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [permissionError, setPermissionError] = useState<string | null>(null);
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
    const conversationRef = React.useRef<ConversationEntry[]>([]);

    const timeFormatter = useMemo(
        () => new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }),
        []
    );

    const currentTime = useTime();

    const toggleMic = () => setMicOn((prev) => !prev);
    const toggleCamera = () => setCameraOn((prev) => !prev);

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
            // Create interview record before starting the call
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

    if (permissionError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#202124] text-white p-4 text-center font-sans">
                <div className="bg-red-500/20 p-5 rounded-full mb-6">
                    <AlertCircle size={64} className="text-red-400" />
                </div>
                <h1 className="text-3xl font-medium mb-3">Camera or Mic Blocked</h1>
                <p className="text-gray-300 mb-8 max-w-md text-lg">
                    {permissionError}
                </p>
                <div className="bg-[#3c4043] p-6 rounded-xl text-left text-gray-200 max-w-md w-full shadow-lg border border-white/10">
                    <p className="font-bold mb-4 text-white text-lg">How to enable access:</p>
                    <ol className="list-decimal pl-5 space-y-3 text-sm md:text-base">
                        <li>Look at the address bar at the top of the browser.</li>
                        <li>Click the <strong>Lock icon</strong> 🔒 or the Settings icon.</li>
                        <li>Toggle <strong>Camera</strong> and <strong>Microphone</strong> to &quot;Allow&quot; or &quot;On&quot;.</li>
                        <li>Click the button below to refresh.</li>
                    </ol>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-10 px-8 py-3 bg-blue-500 text-white rounded-full font-medium text-lg hover:bg-blue-600 transition-colors shadow-lg"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#202124] text-white overflow-hidden font-sans">
            <div className="flex justify-between items-center p-4 h-14 shrink-0">
                <div className="text-lg font-medium tracking-tight text-white/90" />
                <div className="text-lg font-medium text-white/90">
                    {currentTime}
                </div>
            </div>

            <div className="flex-1 flex relative p-4 gap-4 overflow-hidden">
                <div className="flex-1 bg-[#3c4043] rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute w-32 h-32 rounded-full bg-blue-500/20 animate-pulse"></div>
                    <div className="absolute w-24 h-24 rounded-full bg-blue-500/30 animate-pulse delay-75"></div>

                    <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center text-3xl font-medium text-white shadow-lg z-10 relative">
                        I
                        <div className="absolute bottom-0 right-0 p-1 bg-[#3c4043] rounded-full">
                            <div className="bg-blue-500 rounded-full p-1">
                                <Mic size={12} className="text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 text-white font-medium text-sm bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm">
                        Interviewer
                    </div>
                    <div className="absolute bottom-8 right-8 w-64 h-40">
                        <MeetingVideo
                            cameraOn={cameraOn}
                            micOn={micOn}
                            setPermissionError={setPermissionError}
                            userInitial={user?.username?.[0]?.toUpperCase() || 'Y'}
                        />
                    </div>
                </div>

                <div className="w-96 shrink-0 bg-[#2a2d32] rounded-2xl p-4 flex flex-col gap-4 ring-1 ring-white/10 max-h-[calc(100vh-8rem)] overflow-hidden">
                    <div className="flex items-center justify-between shrink-0">
                        <div>
                            <p className="text-sm text-white/80">AI Interview Assistant</p>
                            <p className="text-xs text-white/60">
                                {callStatus === 'in-call' ? 'Live' : callStatus === 'connecting' ? 'Connecting...' : 'Idle'}
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${callStatus === 'in-call' ? 'bg-green-500/20 text-green-200' : 'bg-white/10 text-white/70'}`}>
                            <Radio size={14} className={callStatus === 'in-call' ? 'animate-pulse' : ''} />
                            {isSpeaking ? 'Speaking' : callStatus === 'in-call' ? 'Listening' : 'Idle'}
                        </div>
                    </div>

                    <div className="bg-[#202124] rounded-xl p-3 space-y-2 ring-1 ring-white/5 shrink-0">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/80">User context</span>
                            {contextStatus === 'loading' && <Loader2 size={16} className="animate-spin text-white/60" />}
                            {contextStatus === 'error' && <AlertCircle size={16} className="text-orange-300" />}
                        </div>
                        <div className="text-xs text-white/70 space-y-1">
                            <p>Target role: {context?.profile?.targetRole || 'Not set'}</p>
                            <p>Target company: {context?.profile?.targetCompany || 'Not set'}</p>
                            <p>Level: {context?.profile?.level || 'Not set'}</p>
                            <p>Resume: {context?.resume?.fileName || 'No resume uploaded'}</p>
                        </div>
                    </div>

                    <div className="bg-[#202124] rounded-xl ring-1 ring-white/5 flex-1 min-h-0">
                        <Transcriber conversation={conversation} />
                    </div>

                    {vapiError && (
                        <div className="text-xs text-red-300 bg-red-500/10 rounded-lg p-2 border border-red-500/30 shrink-0">
                            {vapiError}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-20 shrink-0 flex items-center justify-center relative px-6 pb-2">
                <div className="absolute left-6 hidden md:flex items-center text-white font-medium min-w-[200px]">
                    <span className="truncate">Job Interview: Senior Developer</span>
                </div>

                <div className="flex items-center gap-4">
                    <ControlButton
                        isOn={micOn}
                        onClick={toggleMic}
                        onIcon={<Mic size={20} />}
                        offIcon={<MicOff size={20} />}
                        tooltip={micOn ? "Turn off microphone" : "Turn on microphone"}
                    />

                    <ControlButton
                        isOn={cameraOn}
                        onClick={toggleCamera}
                        onIcon={<Video size={20} />}
                        offIcon={<VideoOff size={20} />}
                        tooltip={cameraOn ? "Turn off camera" : "Turn on camera"}
                    />

                    <button
                        onClick={callStatus === 'in-call' ? stopInterview : startInterview}
                        className={`rounded-full px-4 py-3 text-sm font-medium transition-all border ${callStatus === 'in-call'
                            ? 'bg-red-500 text-white border-transparent hover:bg-red-600'
                            : 'bg-green-500 text-white border-transparent hover:bg-green-600'
                            }`}
                        title="Toggle AI interview"
                        disabled={contextStatus === 'loading' || !vapiClient}
                    >
                        {callStatus === 'in-call' ? 'End AI interview' : 'Start AI interview'}
                    </button>

                    <Link href={"/"}>
                        <button
                            className="bg-[#ea4335] hover:bg-[#d93025] text-white rounded-full p-3.5 mx-2 w-14 flex items-center justify-center transition-all duration-200"
                            title="Leave call"
                        >
                            <PhoneOff size={20} fill="currentColor" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

interface ControlButtonProps {
    isOn: boolean;
    onClick: () => void;
    onIcon: React.ReactNode;
    offIcon: React.ReactNode;
    tooltip: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ isOn, onClick, onIcon, offIcon, tooltip }) => {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`
          rounded-full p-3.5 w-12 h-12 flex items-center justify-center transition-all duration-200 border
          ${isOn
                        ? 'bg-[#3c4043] border-transparent text-white hover:bg-[#4a4e51] hover:shadow-lg'
                        : 'bg-[#ea4335] border-transparent text-white hover:bg-[#d93025] hover:shadow-lg'
                    }
        `}
                title={tooltip}
            >
                {isOn ? onIcon : offIcon}
            </button>
        </div>
    );
};

export default Meeting;