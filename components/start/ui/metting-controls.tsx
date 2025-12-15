import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
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
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
    micOn,
    cameraOn,
    callStatus,
    onToggleMic,
    onToggleCamera,
    onStopInterview,
}) => {
    const router = useRouter();
    const [isEnding, setIsEnding] = useState(false);

    const handleLeaveCall = async () => {
        setIsEnding(true);
        try {
            await onStopInterview();
            await new Promise(resolve => setTimeout(resolve, 1000));
            router.push('/dashboard/analytics');
        } catch (error) {
            console.error('Error ending interview:', error);
            setIsEnding(false);
        }
    };

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
                    disabled={isEnding}
                />

                <ControlButton
                    isOn={cameraOn}
                    onClick={onToggleCamera}
                    onIcon={<Video size={20} />}
                    offIcon={<VideoOff size={20} />}
                    tooltip={cameraOn ? "Turn off camera" : "Turn on camera"}
                    disabled={isEnding}
                />

                <button
                    onClick={handleLeaveCall}
                    disabled={isEnding || callStatus !== 'in-call'}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3.5 mx-2 w-14 h-14 flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="End interview and leave"
                >
                    {isEnding ? <Loader2 size={20} className="animate-spin" /> : <PhoneOff size={20} />}
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
                    rounded-full p-3.5 w-12 h-12 flex items-center justify-center transition-all duration-200 border
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