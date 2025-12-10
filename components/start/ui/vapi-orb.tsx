import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface VapiOrbProps {
    isSpeaking: boolean;
    orbScale: number;
}

const VapiOrb: React.FC<VapiOrbProps> = ({ isSpeaking, orbScale }) => {
    return (
        <div className="relative flex items-center justify-center">
            <div
                className="absolute rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-30 transition-transform duration-75 ease-linear"
                style={{
                    width: '170px',
                    height: '170px',
                    transform: `scale(${orbScale * 1.5})`,
                }}
            />

            <div
                className="absolute rounded-full border border-indigo-400/30 transition-transform duration-75 ease-linear"
                style={{
                    width: '180px',
                    height: '180px',
                    transform: `scale(${orbScale * 1.2})`,
                    opacity: isSpeaking ? 0.5 : 0.2
                }}
            />

            <div
                className="absolute rounded-full border border-purple-400/30 transition-transform duration-75 ease-linear"
                style={{
                    width: '140px',
                    height: '140px',
                    transform: `scale(${orbScale * 1.1})`,
                    opacity: isSpeaking ? 0.6 : 0.3
                }}
            />

            <div 
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#4c5157] to-[#202124] flex items-center justify-center shadow-2xl z-10 ring-1 ring-white/10"
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none" />
                
                <div className={`transition-all duration-500 ${isSpeaking ? 'text-indigo-400' : 'text-white/80'}`}>
                    <Sparkles size={32} className={isSpeaking ? "animate-pulse" : ""} />
                </div>

                <div className="absolute bottom-1 right-1 p-1.5 bg-[#202124] rounded-full border border-[#3c4043]">
                    <div className={`rounded-full p-1.5 transition-colors duration-300 ${isSpeaking ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-gray-500'}`}>
                        <Mic size={10} className="text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VapiOrb;