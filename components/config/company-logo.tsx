"use client";

import { motion } from "framer-motion";
import { Mail, Briefcase, CheckCircle2 } from "lucide-react";

interface CompanyCardProps {
  company: {
    id: string;
    companyName: string;
    companyEmail: string;
    role: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  index: number;
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

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isSelected,
  onSelect,
  index,
}) => {
  const style = getCompanyStyle(company.companyName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className={`relative cursor-pointer group ${
        isSelected ? "ring-2 ring-indigo-400 ring-offset-2 rounded-2xl" : ""
      }`}
    >
      <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 bg-indigo-400 text-white rounded-full p-1"
          >
            <CheckCircle2 size={16} />
          </motion.div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-14 h-14 ${style.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
          >
            {style.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-lg truncate">
              {company.companyName}
            </h3>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
              <Mail size={12} />
              {company.companyEmail}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <Briefcase size={14} />
            <span className="font-medium">Role</span>
          </div>
          <p className="text-slate-800 font-bold">{company.role}</p>
        </div>
      </div>
    </motion.div>
  );
};