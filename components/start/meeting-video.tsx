"use client"
import React, { useEffect, useRef, useState } from "react";
import { MicOff, AlertCircle, Smile, Frown, Meh } from "lucide-react";
import FacialDetector from "./facial-detector";

interface MeetingVideoProps {
    cameraOn: boolean;
    micOn: boolean;
    setPermissionError?: (msg: string | null) => void;
    userInitial?: string;
}

const MeetingVideo: React.FC<MeetingVideoProps> = ({
    cameraOn,
    micOn,
    setPermissionError,
    userInitial = "Y",
}) => {
    const videoRef = useRef<HTMLVideoElement>(null as unknown as HTMLVideoElement);
    const streamRef = useRef<MediaStream | null>(null);
    
    const [localPermissionError, setLocalPermissionError] = useState<string | null>(null);
    const [currentExpression, setCurrentExpression] = useState<string>("neutral");

    // video stream handler
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((err: any) => {
                    console.error("Error accessing media devices.", err);
                    const msg =
                        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
                            ? "Permissions blocked. Please allow access in your browser address bar."
                            : "Could not access camera/microphone. Check your system settings.";
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

    const handleExpressionChange = (expression: string) => {
        setCurrentExpression(expression);
    };

    const getExpressionIcon = () => {
        switch (currentExpression) {
            case "happy":
                return <Smile size={14} className="text-green-400" />;
            case "sad":
                return <Frown size={14} className="text-blue-400" />;
            case "angry":
                return <Frown size={14} className="text-red-400" />;
            default:
                return <Meh size={14} className="text-gray-400" />;
        }
    };

    if (localPermissionError) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#202124] text-white p-4 text-center font-sans">
                <div className="bg-red-500/20 p-5 rounded-full mb-6">
                    <AlertCircle size={40} className="text-red-400" />
                </div>
                <h1 className="text-xl font-medium mb-2">Camera or Mic Blocked</h1>
                <p className="text-gray-300 mb-4 max-w-xs text-base">
                    {localPermissionError}
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-[#3c4043] rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/20 group">
            {cameraOn ? (
                <div className="w-full h-full relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1] rounded-xl"
                        style={{ background: "#202124" }}
                    />
                    
                    {/* Facial Detection */}
                    <FacialDetector
                        videoRef={videoRef}
                        isActive={cameraOn}
                        onExpressionChange={handleExpressionChange}
                        detectionInterval={500}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#202124]">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-medium">
                        {userInitial}
                    </div>
                </div>
            )}

            <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <div className="text-white text-xs font-medium px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
                    You
                </div>
                {cameraOn && (
                    <div className="flex items-center gap-1 text-white text-xs font-medium px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
                        {getExpressionIcon()}
                        <span className="capitalize">{currentExpression}</span>
                    </div>
                )}
            </div>

            {!micOn && (
                <div className="absolute top-2 right-2 bg-[#ea4335] p-1.5 rounded-full">
                    <MicOff size={12} className="text-white" />
                </div>
            )}
        </div>
    );
};

export default MeetingVideo;