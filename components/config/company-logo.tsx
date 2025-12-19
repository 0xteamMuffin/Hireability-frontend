'use client';

import { motion } from 'framer-motion';
import { Mail, Briefcase, CheckCircle2 } from 'lucide-react';

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
      className={`group relative cursor-pointer ${
        isSelected ? 'rounded-2xl ring-2 ring-indigo-400 ring-offset-2' : ''
      }`}
    >
      <div className="h-full rounded-2xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg">
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 rounded-full bg-indigo-400 p-1 text-white"
          >
            <CheckCircle2 size={16} />
          </motion.div>
        )}

        <div className="mb-6 flex items-center gap-4">
          <div
            className={`h-14 w-14 ${style.color} flex items-center justify-center rounded-xl text-2xl font-bold text-white shadow-lg`}
          >
            {style.logo}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-800">{company.companyName}</h3>
            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
              <Mail size={12} />
              {company.companyEmail}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
            <Briefcase size={14} />
            <span className="font-medium">Role</span>
          </div>
          <p className="font-bold text-slate-800">{company.role}</p>
        </div>
      </div>
    </motion.div>
  );
};
