import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    onRoundComplete?: () => void;
    showCompleteButton?: boolean;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
    micOn,
    cameraOn,
    callStatus,
    onToggleMic,
    onToggleCamera,
    onStopInterview,
    onRoundComplete,
    showCompleteButton = false,
}) => {
    const router = useRouter();
    const [isEnding, setIsEnding] = useState(false);

    const handleLeaveCall = async () => {
        setIsEnding(true);
        try {
            await onStopInterview();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // If we're in a session, complete the round and go back to round selection
            if (showCompleteButton && onRoundComplete) {
                await onRoundComplete();
            } else {
                router.push('/dashboard/analytics');
            }
        } catch (error) {
            console.error('Error ending interview:', error);
            setIsEnding(false);
        }
    };

    return (
        <div className="h-16 md:h-20 shrink-0 flex items-center justify-center relative px-4 md:px-6 pb-2">
            <div className="absolute left-4 md:left-6 hidden lg:flex items-center text-white font-medium min-w-[200px]">
                <span className="truncate text-sm md:text-base">Job Interview: Senior Developer</span>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <ControlButton
                    isOn={micOn}
                    onClick={onToggleMic}
                    onIcon={<Mic size={18} className="md:w-5 md:h-5" />}
                    offIcon={<MicOff size={18} className="md:w-5 md:h-5" />}
                    tooltip={micOn ? "Turn off microphone" : "Turn on microphone"}
                    disabled={isEnding}
                />

                <ControlButton
                    isOn={cameraOn}
                    onClick={onToggleCamera}
                    onIcon={<Video size={18} className="md:w-5 md:h-5" />}
                    offIcon={<VideoOff size={18} className="md:w-5 md:h-5" />}
                    tooltip={cameraOn ? "Turn off camera" : "Turn on camera"}
                    disabled={isEnding}
                />

                <button
                    onClick={handleLeaveCall}
                    disabled={isEnding || callStatus !== 'in-call'}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 md:p-3.5 mx-1 md:mx-2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="End interview and leave"
                >
                    {isEnding ? <Loader2 size={18} className="md:w-5 md:h-5 animate-spin" /> : <PhoneOff size={18} className="md:w-5 md:h-5" />}
                </button>
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
    disabled?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({ isOn, onClick, onIcon, offIcon, tooltip, disabled = false }) => {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                disabled={disabled}
                className={`
                    rounded-full p-3 md:p-3.5 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200 border
                    ${isOn
                        ? 'bg-[#3c4043] border-transparent text-white hover:bg-[#4a4e51] hover:shadow-lg'
                        : 'bg-[#ea4335] border-transparent text-white hover:bg-[#d93025] hover:shadow-lg'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={tooltip}
            >
                {isOn ? onIcon : offIcon}
            </button>
        </div>
    );
};

export default MeetingControls;