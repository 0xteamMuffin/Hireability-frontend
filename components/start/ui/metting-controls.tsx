import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MeetingControlsProps {
  micOn: boolean;
  cameraOn: boolean;
  callStatus: 'idle' | 'connecting' | 'in-call';
  contextStatus: 'idle' | 'loading' | 'error';

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
    if (isEnding) return;

    setIsEnding(true);
    try {
      console.log('[handleLeaveCall] stopping interview...');

      await onStopInterview();
      console.log('[handleLeaveCall] interview stopped, all data saved');

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (showCompleteButton && onRoundComplete) {
        console.log('[handleLeaveCall] completing round...');
        await onRoundComplete();
      } else {
        console.log('[handleLeaveCall] navigating to analytics...');
        router.push('/dashboard/analytics');
      }
    } catch (error) {
      console.error('Error ending interview:', error);
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="relative flex h-16 shrink-0 items-center justify-center px-4 pb-2 md:h-20 md:px-6">
      <div className="absolute left-4 hidden min-w-[200px] items-center font-medium text-white md:left-6 lg:flex">
        <span className="truncate text-sm md:text-base">Job Interview: Senior Developer</span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <ControlButton
          isOn={micOn}
          onClick={onToggleMic}
          onIcon={<Mic size={18} className="md:h-5 md:w-5" />}
          offIcon={<MicOff size={18} className="md:h-5 md:w-5" />}
          tooltip={micOn ? 'Turn off microphone' : 'Turn on microphone'}
          disabled={isEnding}
        />

        <ControlButton
          isOn={cameraOn}
          onClick={onToggleCamera}
          onIcon={<Video size={18} className="md:h-5 md:w-5" />}
          offIcon={<VideoOff size={18} className="md:h-5 md:w-5" />}
          tooltip={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          disabled={isEnding}
        />

        <button
          onClick={handleLeaveCall}
          disabled={isEnding || callStatus !== 'in-call'}
          className="mx-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 p-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:mx-2 md:h-14 md:w-14 md:p-3.5"
          title="End interview and leave"
        >
          {isEnding ? (
            <Loader2 size={18} className="animate-spin md:h-5 md:w-5" />
          ) : (
            <PhoneOff size={18} className="md:h-5 md:w-5" />
          )}
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

const ControlButton: React.FC<ControlButtonProps> = ({
  isOn,
  onClick,
  onIcon,
  offIcon,
  tooltip,
  disabled = false,
}) => {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex h-11 w-11 items-center justify-center rounded-full border p-3 transition-all duration-200 md:h-12 md:w-12 md:p-3.5 ${
          isOn
            ? 'border-transparent bg-[#3c4043] text-white hover:bg-[#4a4e51] hover:shadow-lg'
            : 'border-transparent bg-[#ea4335] text-white hover:bg-[#d93025] hover:shadow-lg'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
        title={tooltip}
      >
        {isOn ? onIcon : offIcon}
      </button>
    </div>
  );
};

export default MeetingControls;
