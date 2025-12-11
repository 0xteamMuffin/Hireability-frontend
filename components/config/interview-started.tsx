"use client";

import { motion } from "framer-motion";
import { Mail, Play } from "lucide-react";
import Link from "next/link";

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
    "bg-orange-400",
    "bg-blue-400",
    "bg-red-400",
    "bg-cyan-400",
    "bg-indigo-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-teal-400",
    "bg-rose-400",
    "bg-amber-400",
  ];

  const colorIndex =
    companyName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  return {
    logo: companyName[0].toUpperCase(),
    color: colors[colorIndex],
  };
};

export const InterviewStartBar: React.FC<InterviewStartBarProps> = ({
  selectedCompany,
}) => {
  const style = getCompanyStyle(selectedCompany.companyName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-6 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1">
          <div
            className={`w-16 h-16 ${style.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0`}
          >
            {style.logo}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-xl mb-1">
              {selectedCompany.role} @ {selectedCompany.companyName}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Mail size={14} />
              {selectedCompany.companyEmail}
            </p>
          </div>
        </div>

        <Link href={`/start?targetId=${selectedCompany.id}`}>
          <button className="bg-indigo-400 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all flex items-center gap-2 group whitespace-nowrap cursor-pointer">
            Start Interview
            <Play
              size={20}
              className="fill-white group-hover:translate-x-1 transition-transform"
            />
          </button>
        </Link>
      </div>
    </motion.div>
  );
};