'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, User, Plus } from 'lucide-react';
import Link from 'next/link';
import { InterviewStartBar } from '@/components/config/interview-started';
import { CompanyCard } from '@/components/config/company-logo';
import { targetApi, TargetCompany, profileApi } from '@/lib/api';
import { Profile } from '@/lib/types';

const ConfigPage = () => {
  const [targets, setTargets] = useState<TargetCompany[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [targetsResponse, profileResponse] = await Promise.all([
      targetApi.getAll(),
      profileApi.get(),
    ]);
    if (targetsResponse.success && targetsResponse.data) {
      setTargets(targetsResponse.data);
    }
    if (profileResponse.success && profileResponse.data) {
      setProfile(profileResponse.data);
    }
    setLoading(false);
  };

  const selected =
    selectedCompany === 'default-profile'
      ? profile && profile.targetCompany && profile.targetRole
        ? {
            id: 'default-profile',
            companyName: profile.targetCompany,
            companyEmail: '',
            role: profile.targetRole,
          }
        : null
      : targets.find((c) => c.id === selectedCompany);

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-50/50 blur-[100px]"></div>
      </div>

      <header className="relative z-10 border-b border-slate-200/60 bg-white/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="rounded-xl p-2 transition-colors hover:bg-slate-100">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Select Interview</h1>
              <p className="text-sm text-slate-500">
                Choose a company to start your mock interview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400 shadow-md shadow-indigo-200">
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-slate-800 md:block">
              HireAbility
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto p-4 pb-32 md:p-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-6"
          >
            <div className="rounded-lg bg-indigo-400 p-2 text-white">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-bold text-slate-800">AI-Powered Mock Interviews</h3>
              <p className="text-sm text-slate-600">
                Our AI interviewer adapts to your responses and provides real-time feedback. Select
                a company below to begin your practice session.
              </p>
            </div>
            <Link href="/dashboard/target">
              <button className="flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-indigo-600 shadow-sm transition-all hover:bg-indigo-50">
                <Plus size={16} />
                Add Target
              </button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
            </div>
          ) : targets.length === 0 &&
            (!profile || !profile.targetCompany || !profile.targetRole) ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/40 py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                <Sparkles size={32} />
              </div>
              <p className="mb-2 font-medium text-slate-500">No target companies yet</p>
              <p className="mb-4 text-sm text-slate-400">
                Add your target companies in the dashboard to start practicing interviews.
              </p>
              <Link href="/dashboard/target">
                <button className="rounded-xl bg-indigo-400 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500">
                  Add Target Companies
                </button>
              </Link>
            </div>
          ) : (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Default Profile Card */}
              {profile && profile.targetCompany && profile.targetRole && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  onClick={() => setSelectedCompany('default-profile')}
                  className={`relative cursor-pointer rounded-3xl border-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    selectedCompany === 'default-profile'
                      ? 'border-indigo-400 shadow-lg ring-2 shadow-indigo-100 ring-indigo-200'
                      : 'border-indigo-200 hover:border-indigo-300'
                  }`}
                >
                  {selectedCompany === 'default-profile' && (
                    <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-400">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-400 shadow-md shadow-indigo-200">
                      <User size={28} className="text-white" />
                    </div>
                    <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600">
                      Default
                    </div>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-slate-800">{profile.targetCompany}</h3>
                  <p className="mb-2 text-sm text-slate-500">{profile.targetRole}</p>
                  <p className="text-xs font-medium text-indigo-500">
                    From your onboarding profile
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {targets.map((company, idx) => (
                  <CompanyCard
                    key={company.id}
                    company={{
                      id: company.id,
                      companyName: company.companyName,
                      companyEmail: company.companyEmail || '',
                      role: company.role,
                    }}
                    isSelected={selectedCompany === company.id}
                    onSelect={() => setSelectedCompany(company.id)}
                    index={profile && profile.targetCompany ? idx + 1 : idx}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <InterviewStartBar
            selectedCompany={{
              id: selected.id,
              companyName: selected.companyName,
              companyEmail: selected.companyEmail || '',
              role: selected.role,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfigPage;
