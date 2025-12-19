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
        className="absolute rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-xl transition-transform duration-75 ease-linear"
        style={{
          width: '120px',
          height: '120px',
          transform: `scale(${orbScale * 1.5})`,
        }}
      />

      <div
        className="absolute rounded-full border border-indigo-400/30 transition-transform duration-75 ease-linear"
        style={{
          width: '130px',
          height: '130px',
          transform: `scale(${orbScale * 1.2})`,
          opacity: isSpeaking ? 0.5 : 0.2,
        }}
      />

      <div
        className="absolute rounded-full border border-purple-400/30 transition-transform duration-75 ease-linear"
        style={{
          width: '100px',
          height: '100px',
          transform: `scale(${orbScale * 1.1})`,
          opacity: isSpeaking ? 0.6 : 0.3,
        }}
      />

      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4c5157] to-[#202124] shadow-2xl ring-1 ring-white/10 md:h-28 md:w-28">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/5" />

        <div
          className={`transition-all duration-500 ${isSpeaking ? 'text-indigo-400' : 'text-white/80'}`}
        >
          <Sparkles size={24} className={`md:h-8 md:w-8 ${isSpeaking ? 'animate-pulse' : ''}`} />
        </div>

        <div className="absolute right-0.5 bottom-0.5 rounded-full border border-[#3c4043] bg-[#202124] p-1 md:right-1 md:bottom-1 md:p-1.5">
          <div
            className={`rounded-full p-1 transition-colors duration-300 md:p-1.5 ${isSpeaking ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-gray-500'}`}
          >
            <Mic size={8} className="text-white md:h-2.5 md:w-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VapiOrb;
