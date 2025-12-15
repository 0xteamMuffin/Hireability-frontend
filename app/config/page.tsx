"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, User } from "lucide-react";
import Link from "next/link";
import { InterviewStartBar } from "@/components/config/interview-started";
import { CompanyCard } from "@/components/config/company-logo";
import { targetApi, TargetCompany, profileApi } from "@/lib/api";
import { Profile } from "@/lib/types";

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

  const selected = selectedCompany === "default-profile"
    ? profile && profile.targetCompany && profile.targetRole
      ? {
          id: "default-profile",
          companyName: profile.targetCompany,
          companyEmail: "",
          role: profile.targetRole,
        }
      : null
    : targets.find((c) => c.id === selectedCompany);

  return (
    <div
      className="min-h-screen relative flex flex-col overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 blur-[100px] rounded-full"></div>
      </div>

      <header className="relative z-10 border-b border-slate-200/60 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Select Interview
              </h1>
              <p className="text-sm text-slate-500">
                Choose a company to start your mock interview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight hidden md:block">
              HireAbility
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-start gap-4"
          >
            <div className="p-2 bg-indigo-400 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">
                AI-Powered Mock Interviews
              </h3>
              <p className="text-sm text-slate-600">
                Our AI interviewer adapts to your responses and provides
                real-time feedback. Select a company below to begin your
                practice session.
              </p>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
            </div>
          ) : targets.length === 0 && (!profile || !profile.targetCompany || !profile.targetRole) ? (
            <div className="text-center py-20 bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Sparkles size={32} />
              </div>
              <p className="text-slate-500 font-medium mb-2">No target companies yet</p>
              <p className="text-slate-400 text-sm mb-4">
                Add your target companies in the dashboard to start practicing interviews.
              </p>
              <Link href="/dashboard/target">
                <button className="bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all">
                  Add Target Companies
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Default Profile Card */}
              {profile && profile.targetCompany && profile.targetRole && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  onClick={() => setSelectedCompany("default-profile")}
                  className={`relative bg-gradient-to-br from-indigo-50 to-purple-50 border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    selectedCompany === "default-profile"
                      ? "border-indigo-400 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200"
                      : "border-indigo-200 hover:border-indigo-300"
                  }`}
                >
                  {selectedCompany === "default-profile" && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-indigo-400 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
                      <User size={28} className="text-white" />
                    </div>
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full">
                      Default
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{profile.targetCompany}</h3>
                  <p className="text-sm text-slate-500 mb-2">{profile.targetRole}</p>
                  <p className="text-xs text-indigo-500 font-medium">From your onboarding profile</p>
                </motion.div>
              )}

              <AnimatePresence>
                {targets.map((company, idx) => (
                  <CompanyCard
                    key={company.id}
                    company={{
                      id: company.id,
                      companyName: company.companyName,
                      companyEmail: company.companyEmail || "",
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
              companyEmail: selected.companyEmail || "",
              role: selected.role,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfigPage;