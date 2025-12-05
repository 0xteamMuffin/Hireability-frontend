"use client"
import React, { useState, useEffect } from 'react';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import MeetingVideo from './meeting-video';

const useTime = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Meeting: React.FC = () => {
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const currentTime = useTime();

    const toggleMic = () => setMicOn((prev) => !prev);
    const toggleCamera = () => setCameraOn((prev) => !prev);

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
                <div className="text-lg font-medium tracking-tight text-white/90">
                </div>
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
                </div>

                <div className="absolute bottom-8 right-8 w-64 h-40">
                    <MeetingVideo
                        cameraOn={cameraOn}
                        micOn={micOn}
                        setPermissionError={setPermissionError}
                        userInitial="Y"
                    />
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