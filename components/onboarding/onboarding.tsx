"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Briefcase,
  Building2,
  Award,
} from "lucide-react";

// Define the shape of the form state
interface OnboardingData {
  role: string;
  company: string;
  level: string;
  resume: File | null;
}

export const OnboardingPage = () => {
  const [step, setStep] = useState<number>(1);

  // Typed State for selections
  const [formData, setFormData] = useState<OnboardingData>({
    role: "",
    company: "",
    level: "",
    resume: null,
  });

  const totalSteps = 4;

  // Data Lists
  const roles: string[] = [
    "Frontend Developer",
    "Backend Developer",
    "FullStack Engineer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Manager",
    "Mobile Developer",
    "QA Engineer",
  ];

  const companies: string[] = [
    "Amazon",
    "Google",
    "Meta",
    "Apple",
    "Netflix",
    "Microsoft",
    "Uber",
    "Airbnb",
  ];

  const levels: string[] = [
    "Intern",
    "Junior (SDE I)",
    "Mid-Level (SDE II)",
    "Senior (SDE III)",
    "Staff Engineer",
    "Engineering Manager",
  ];

  // Helper to handle selection safely
  const handleSelect = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Navigation Handlers
  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Animation Variants typed correctly
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-200/40 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* --- MAIN GLASS CARD --- */}
      {/* UPDATED: Changed max-w-2xl to max-w-5xl for a wider layout */}
      <div className="relative z-10 w-full max-w-5xl px-4">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto px-2">
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? "w-8 bg-indigo-400" : "w-4 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Step {step} of {totalSteps}
          </span>
        </div>

        <motion.div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-12 overflow-hidden min-h-[600px] flex flex-col">
          {/* DYNAMIC CONTENT AREA */}
          <div className="flex-grow flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={step}>
              {/* STEP 1: JOB ROLE */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                      <Briefcase size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-3">
                      Target Role
                    </h2>
                    <p className="text-slate-500 text-lg">
                      What position are you interviewing for?
                    </p>
                  </div>

                  {/* UPDATED GRID: grid-cols-2 md:grid-cols-4 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleSelect("role", role)}
                        className={`p-6 rounded-2xl border text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center h-full ${
                          formData.role === role
                            ? "bg-indigo-400 text-white border-indigo-400 shadow-xl shadow-indigo-200 scale-105"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-1"
                        }`}
                      >
                        {role}
                        {formData.role === role && (
                          <CheckCircle size={16} className="text-white/80" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: COMPANY */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                      <Building2 size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-3">
                      Target Company
                    </h2>
                    <p className="text-slate-500 text-lg">
                      Select a company style to mimic their interview process.
                    </p>
                  </div>

                  {/* UPDATED GRID: grid-cols-2 md:grid-cols-4 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {companies.map((company) => (
                      <button
                        key={company}
                        onClick={() => handleSelect("company", company)}
                        className={`p-6 rounded-2xl border text-base font-semibold transition-all duration-200 ${
                          formData.company === company
                            ? "bg-indigo-400 text-white border-indigo-400 shadow-xl shadow-indigo-200 scale-105"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-1"
                        }`}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SENIORITY */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                      <Award size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-3">
                      Experience Level
                    </h2>
                    <p className="text-slate-500 text-lg">
                      Choose the difficulty level for your questions.
                    </p>
                  </div>

                  {/* UPDATED GRID: grid-cols-1 md:grid-cols-3 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => handleSelect("level", level)}
                        className={`p-6 rounded-2xl border text-sm font-semibold transition-all duration-200 flex items-center justify-between group ${
                          formData.level === level
                            ? "bg-indigo-400 text-white border-indigo-400 shadow-xl shadow-indigo-200 scale-105"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-1"
                        }`}
                      >
                        {level}
                        {formData.level === level && <CheckCircle size={20} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: RESUME UPLOAD */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                      <FileText size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-3">
                      Upload Resume
                    </h2>
                    <p className="text-slate-500 text-lg">
                      Optional: Let AI tailor questions to your CV.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto border-3 border-dashed border-slate-200 rounded-[2rem] p-16 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group bg-slate-50/50">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 shadow-sm transition-all">
                      <Upload size={36} />
                    </div>
                    <p className="font-bold text-xl text-slate-700 mb-2">
                      Click to upload PDF or DOCX
                    </p>
                    <p className="text-slate-400">Maximum file size 5MB</p>
                  </div>

                  <div className="text-center mt-8">
                    <button
                      onClick={handleNext}
                      className="text-slate-400 hover:text-indigo-400 font-medium transition-colors hover:underline"
                    >
                      Skip for now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM NAVIGATION */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50 ${
                step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <ArrowLeft size={20} /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.role) ||
                (step === 2 && !formData.company) ||
                (step === 3 && !formData.level)
              }
              className="bg-indigo-400 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:shadow-indigo-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
              {step === totalSteps ? "Finish Setup" : "Next"}{" "}
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
