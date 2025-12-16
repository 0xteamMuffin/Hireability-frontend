"use client"
import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, Loader2, Radio } from 'lucide-react';
import MeetingVideo from './meeting-video';
import { useAuth } from '@/lib/hooks';
import Transcriber from './transcriber';
import VapiOrb from './ui/vapi-orb';
import MeetingControls from './ui/metting-controls';
import { useVapi } from '@/lib/hooks/useVapi';
import { useSearchParams } from 'next/navigation';
import CodeEditor from './code-editor';


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
    const searchParams = useSearchParams();
    const targetId = searchParams.get('targetId');
    
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [orbScale, setOrbScale] = useState(1);
    const animationRef = useRef<number | null>(null);
    const hasStartedRef = useRef(false);
    
    // Expression tracking
    const expressionDataRef = useRef<{
        angry: number[];
        sad: number[];
        happy: number[];
        neutral: number[];
        surprised: number[];
        fearful: number[];
        disgusted: number[];
    }>({
        angry: [],
        sad: [],
        happy: [],
        neutral: [],
        surprised: [],
        fearful: [],
        disgusted: [],
    });

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
    } = useVapi({ user, targetId });

    const currentTime = useTime();

    const toggleMic = () => setMicOn((prev) => !prev);
    const toggleCamera = () => setCameraOn((prev) => !prev);

    // Handle expression data from facial detector
    const handleExpressionChange = (expressions: Record<string, number>) => {
        Object.entries(expressions).forEach(([emotion, value]) => {
            if (emotion in expressionDataRef.current) {
                expressionDataRef.current[emotion as keyof typeof expressionDataRef.current].push(value);
            }
        });
    };

    // Calculate and log average expressions when call ends
    const logAverageExpressions = () => {
        const averages: Record<string, number> = {};
        
        Object.entries(expressionDataRef.current).forEach(([emotion, values]) => {
            if (values.length > 0) {
                const sum = values.reduce((acc, val) => acc + val, 0);
                averages[emotion] = Math.round((sum / values.length) * 100) / 100;
            } else {
                averages[emotion] = 0;
            }
        });

        console.log('📊 INTERVIEW ENDED - Average Expression Values:');
        console.log(averages);
        console.log(`📈 Total samples collected: ${expressionDataRef.current.happy.length}`);
        
        // Reset data for next interview
        expressionDataRef.current = {
            angry: [],
            sad: [],
            happy: [],
            neutral: [],
            surprised: [],
            fearful: [],
            disgusted: [],
        };
    };

    // Track call status changes to detect when call ends
    const prevCallStatusRef = useRef(callStatus);
    useEffect(() => {
        if (prevCallStatusRef.current === 'in-call' && callStatus === 'idle') {
            logAverageExpressions();
        }
        prevCallStatusRef.current = callStatus;
    }, [callStatus]);

    // Auto-start interview only once when component mounts
    useEffect(() => {
        if (vapiClient && callStatus === 'idle' && contextStatus !== 'loading' && !vapiError && !hasStartedRef.current) {
            hasStartedRef.current = true;
            startInterview();
        }
    }, [vapiClient, callStatus, contextStatus, vapiError, startInterview]);

    // Animation effect for orb
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

    if (permissionError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#202124] text-white p-4 text-center font-sans">
                <div className="bg-red-500/20 p-5 rounded-full mb-6">
                    <AlertCircle size={64} className="text-red-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-medium mb-3">Camera or Mic Blocked</h1>
                <p className="text-gray-300 mb-8 max-w-md text-base md:text-lg">{permissionError}</p>
                <div className="bg-[#3c4043] p-4 md:p-6 rounded-xl text-left text-gray-200 max-w-md w-full shadow-lg border border-white/10">
                    <p className="font-bold mb-4 text-white text-base md:text-lg">How to enable access:</p>
                    <ol className="list-decimal pl-5 space-y-3 text-sm md:text-base">
                        <li>Look at the address bar at the top of the browser.</li>
                        <li>Click the <strong>Lock icon</strong> 🔒 or the Settings icon.</li>
                        <li>Toggle <strong>Camera</strong> and <strong>Microphone</strong> to &quot;Allow&quot; or &quot;On&quot;.</li>
                        <li>Click the button below to refresh.</li>
                    </ol>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-10 px-6 md:px-8 py-2.5 md:py-3 bg-blue-500 text-white rounded-full font-medium text-base md:text-lg hover:bg-blue-600 transition-colors shadow-lg"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    // Show loading screen while connecting
    if (callStatus !== 'in-call') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#202124] text-white">
                <Loader2 size={48} className="animate-spin text-indigo-400 mb-4" />
                <p className="text-base md:text-lg text-white/80">Connecting to interview...</p>
                {vapiError && (
                    <p className="text-sm text-red-400 mt-2 px-4 text-center">{vapiError}</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#202124] text-white overflow-hidden font-sans">
            {/* Header - responsive */}
            <div className="flex justify-between items-center p-3 md:p-4 h-12 md:h-14 shrink-0">
                <div className="text-base md:text-lg font-medium tracking-tight text-white/90" />
                <div className="text-base md:text-lg font-medium text-white/90">
                    {currentTime}
                </div>
            </div>

            {/* Main Content - responsive layout */}
            <div className="flex-1 flex flex-col lg:flex-row relative p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
                {/* Main Video Area */}
                <div className="flex-1 bg-[#3c4043] rounded-xl md:rounded-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10 min-h-[40vh] lg:min-h-0">
                    <VapiOrb isSpeaking={isSpeaking} orbScale={orbScale} />

                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 text-white font-medium text-xs md:text-sm bg-black/40 px-2 md:px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                        Interviewer
                    </div>
                    
                    {/* User Video - responsive positioning */}
                    <div className="absolute bottom-2 right-2 w-32 h-24 md:bottom-8 md:right-8 md:w-64 md:h-40">
                        <MeetingVideo
                            cameraOn={cameraOn}
                            micOn={micOn}
                            setPermissionError={setPermissionError}
                            userInitial={user?.username?.[0]?.toUpperCase() || 'Y'}
                            onExpressionChange={handleExpressionChange}
                        />
                    </div>
                </div>

                {/* Sidebar - responsive */}
                <div className="w-full lg:w-96 shrink-0 bg-[#2a2d32] rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col gap-3 md:gap-4 ring-1 ring-white/10 max-h-[40vh] lg:max-h-[calc(100vh-8rem)] overflow-hidden">
                    <div className="flex items-center justify-between shrink-0">
                        <div>
                            <p className="text-xs md:text-sm text-white/80">AI Interview Assistant</p>
                            <p className="text-[10px] md:text-xs text-white/60">
                                {callStatus === 'in-call' ? 'Live' : callStatus === 'connecting' ? 'Connecting...' : 'Idle'}
                            </p>
                        </div>
                        <div className={`flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full border transition-all duration-300 ${callStatus === 'in-call' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200' : 'bg-white/5 border-white/10 text-white/70'}`}>
                            <Radio size={12} className={callStatus === 'in-call' ? 'animate-pulse text-indigo-400' : ''} />
                            {isSpeaking ? 'Speaking' : callStatus === 'in-call' ? 'Listening' : 'Idle'}
                        </div>
                    </div>

                    {/* Context Card - responsive */}
                    <div className="bg-[#202124] rounded-lg md:rounded-xl p-2 md:p-3 space-y-1.5 md:space-y-2 ring-1 ring-white/5 shrink-0">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-white/80">User context</span>
                            {contextStatus === 'loading' && <Loader2 size={14} className="animate-spin text-white/60" />}
                            {contextStatus === 'error' && <AlertCircle size={14} className="text-orange-300" />}
                        </div>
                        <div className="text-[10px] md:text-xs text-white/70 space-y-0.5 md:space-y-1">
                            <p className="truncate">Target role: {context?.profile?.targetRole || 'Not set'}</p>
                            <p className="truncate">Target company: {context?.profile?.targetCompany || 'Not set'}</p>
                            <p>Level: {context?.profile?.level || 'Not set'}</p>
                            <p className="truncate">Resume: {context?.resume?.fileName || 'No resume uploaded'}</p>
                        </div>
                    </div>

                    {/* Transcriber - responsive */}
                    <div className="bg-[#202124] rounded-lg md:rounded-xl ring-1 ring-white/5 flex-1 min-h-0">
                        <Transcriber conversation={conversation} />
                    </div>

                    {vapiError && (
                        <div className="text-[10px] md:text-xs text-red-300 bg-red-500/10 rounded-lg p-2 border border-red-500/30 shrink-0">
                            {vapiError}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls - always at bottom */}
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
            />

            {/* Code Editor - hide on mobile */}
            <div className="hidden lg:block">
                <CodeEditor />
            </div>
        </div>
    );
};

export default Meeting;