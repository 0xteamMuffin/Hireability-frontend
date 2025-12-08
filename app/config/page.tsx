"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { InterviewStartBar } from "@/components/config/interview-started";
import { CompanyCard } from "@/components/config/company-logo";
import { targetApi, TargetCompany } from "@/lib/api";

const ConfigPage = () => {
  const [targets, setTargets] = useState<TargetCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setLoading(true);
    const response = await targetApi.getAll();
    if (response.success && response.data) {
      setTargets(response.data);
    }
    setLoading(false);
  };

  const selected = targets.find((c) => c.id === selectedCompany);

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
          ) : targets.length === 0 ? (
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
                    index={idx}
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