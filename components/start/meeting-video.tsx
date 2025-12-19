'use client';
import React, { useEffect, useRef, useState } from 'react';
import { MicOff, AlertCircle, Smile, Frown, Meh } from 'lucide-react';
import FacialDetector from './facial-detector';

interface MeetingVideoProps {
  cameraOn: boolean;
  micOn: boolean;
  setPermissionError?: (msg: string | null) => void;
  userInitial?: string;
  onExpressionChange?: (expressions: Record<string, number>) => void;
}

const MeetingVideo: React.FC<MeetingVideoProps> = ({
  cameraOn,
  micOn,
  setPermissionError,
  userInitial = 'Y',
  onExpressionChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null as unknown as HTMLVideoElement);
  const streamRef = useRef<MediaStream | null>(null);

  const [localPermissionError, setLocalPermissionError] = useState<string | null>(null);
  const [currentExpression, setCurrentExpression] = useState<string>('neutral');

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (cameraOn || micOn) {
      navigator.mediaDevices
        .getUserMedia({
          video: cameraOn,
          audio: micOn,
        })
        .then((mediaStream) => {
          setLocalPermissionError(null);
          setPermissionError?.(null);
          streamRef.current = mediaStream;
          if (videoRef.current && cameraOn) {
            videoRef.current.srcObject = mediaStream;
          }
          if (videoRef.current && !cameraOn) {
            videoRef.current.srcObject = null;
          }
        })

        .catch((err: any) => {
          console.error('Error accessing media devices.', err);
          const msg =
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'Permissions blocked. Please allow access in your browser address bar.'
              : 'Could not access camera/microphone. Check your system settings.';
          setLocalPermissionError(msg);
          setPermissionError?.(msg);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        });
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOn, micOn, setPermissionError]);

  const handleExpressionChange = (expressions: Record<string, number>) => {
    onExpressionChange?.(expressions);

    const dominantExpression = Object.entries(expressions).reduce((prev, current) =>
      prev[1] > current[1] ? prev : current,
    )[0];

    setCurrentExpression(dominantExpression);
  };

  const getExpressionIcon = () => {
    switch (currentExpression) {
      case 'happy':
        return <Smile size={14} className="text-green-400" />;
      case 'sad':
        return <Frown size={14} className="text-blue-400" />;
      case 'angry':
        return <Frown size={14} className="text-red-400" />;
      default:
        return <Meh size={14} className="text-gray-400" />;
    }
  };

  if (localPermissionError) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#202124] p-4 text-center font-sans text-white">
        <div className="mb-6 rounded-full bg-red-500/20 p-5">
          <AlertCircle size={40} className="text-red-400" />
        </div>
        <h1 className="mb-2 text-xl font-medium">Camera or Mic Blocked</h1>
        <p className="mb-4 max-w-xs text-base text-gray-300">{localPermissionError}</p>
      </div>
    );
  }

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-xl bg-[#3c4043] shadow-2xl ring-1 ring-white/20">
      {cameraOn ? (
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full scale-x-[-1] transform rounded-xl object-cover"
            style={{ background: '#202124' }}
          />

          {/* Facial Detection */}
          <FacialDetector
            videoRef={videoRef}
            isActive={cameraOn}
            onExpressionChange={handleExpressionChange}
            detectionInterval={500}
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#202124]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-lg font-medium text-white">
            {userInitial}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className="rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          You
        </div>
        {cameraOn && (
          <div className="flex items-center gap-1 rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {getExpressionIcon()}
            <span className="capitalize">{currentExpression}</span>
          </div>
        )}
      </div>

      {!micOn && (
        <div className="absolute top-2 right-2 rounded-full bg-[#ea4335] p-1.5">
          <MicOff size={12} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default MeetingVideo;
