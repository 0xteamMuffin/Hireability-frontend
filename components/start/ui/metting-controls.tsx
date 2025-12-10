import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import Link from 'next/link';

interface MeetingControlsProps {
    micOn: boolean;
    cameraOn: boolean;
    callStatus: 'idle' | 'connecting' | 'in-call';
    contextStatus: 'idle' | 'loading' | 'error';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapiClient: any;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onStartInterview: () => void;
    onStopInterview: () => void;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
    micOn,
    cameraOn,
    callStatus,
    contextStatus,
    vapiClient,
    onToggleMic,
    onToggleCamera,
    onStartInterview,
    onStopInterview,
}) => {
    return (
        <div className="h-20 shrink-0 flex items-center justify-center relative px-6 pb-2">
            <div className="absolute left-6 hidden md:flex items-center text-white font-medium min-w-[200px]">
                <span className="truncate">Job Interview: Senior Developer</span>
            </div>

            <div className="flex items-center gap-4">
                <ControlButton
                    isOn={micOn}
                    onClick={onToggleMic}
                    onIcon={<Mic size={20} />}
                    offIcon={<MicOff size={20} />}
                    tooltip={micOn ? "Turn off microphone" : "Turn on microphone"}
                />

                <ControlButton
                    isOn={cameraOn}
                    onClick={onToggleCamera}
                    onIcon={<Video size={20} />}
                    offIcon={<VideoOff size={20} />}
                    tooltip={cameraOn ? "Turn off camera" : "Turn on camera"}
                />

                <button
                    onClick={callStatus === 'in-call' ? onStopInterview : onStartInterview}
                    className={`rounded-full px-6 py-3 text-sm font-medium transition-all shadow-lg hover:scale-105 active:scale-95 ${
                        callStatus === 'in-call'
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                    }`}
                    title="Toggle AI interview"
                    disabled={contextStatus === 'loading' || !vapiClient}
                >
                    {callStatus === 'in-call' ? 'End Interview' : 'Start Interview'}
                </button>

                <Link href={"/"}>
                    <button
                        className="bg-[#2a2d32] hover:bg-[#3c4043] text-white/80 hover:text-white rounded-full p-3.5 mx-2 w-14 flex items-center justify-center transition-all duration-200 border border-white/5"
                        title="Leave call"
                    >
                        <PhoneOff size={20} />
                    </button>
                </Link>
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

export default MeetingControls;