'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { sessionApi } from '@/lib/api';

interface InterviewStartBarProps {
  selectedCompany: {
    id: string;
    companyName: string;
    companyEmail: string;
    role: string;
  };
}

const getCompanyStyle = (companyName: string) => {
  const colors = [
    'bg-orange-400',
    'bg-blue-400',
    'bg-red-400',
    'bg-cyan-400',
    'bg-indigo-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-green-400',
    'bg-yellow-400',
    'bg-teal-400',
    'bg-rose-400',
    'bg-amber-400',
  ];

  const colorIndex =
    companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return {
    logo: companyName[0].toUpperCase(),
    color: colors[colorIndex],
  };
};

export const InterviewStartBar: React.FC<InterviewStartBarProps> = ({ selectedCompany }) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const style = getCompanyStyle(selectedCompany.companyName);

  const handleCreateSession = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const targetId = selectedCompany.id === 'default-profile' ? undefined : selectedCompany.id;
      const response = await sessionApi.createSession({ targetId });

      if (response.success) {
        router.push('/dashboard/interviews');
      } else {
        console.error('Failed to create session:', response.error);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-1 items-center gap-6">
          <div
            className={`h-16 w-16 ${style.color} flex shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-lg`}
          >
            {style.logo}
          </div>
          <div className="min-w-0">
            <h3 className="mb-1 text-xl font-bold text-slate-800">
              {selectedCompany.role} @ {selectedCompany.companyName}
            </h3>
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <Mail size={14} />
              {selectedCompany.companyEmail}
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateSession}
          disabled={isCreating}
          className="group flex cursor-pointer items-center gap-2 rounded-full bg-indigo-400 px-8 py-4 font-bold whitespace-nowrap text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          {isCreating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create Interview Session
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
