'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Briefcase,
  Building2,
  Award,
  Loader2,
} from 'lucide-react';
import { profileApi, documentApi } from '@/lib/api';

interface OnboardingData {
  role: string;
  company: string;
  level: string;
  resume: File | null;
}

export const OnboardingPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    role: '',
    company: '',
    level: '',
    resume: null,
  });

  const totalSteps = 4;

  const roles: string[] = [
    'Frontend Developer',
    'Backend Developer',
    'FullStack Engineer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'Mobile Developer',
    'QA Engineer',
  ];

  const companies: string[] = [
    'Amazon',
    'Google',
    'Meta',
    'Apple',
    'Netflix',
    'Microsoft',
    'Uber',
    'Airbnb',
  ];

  const levels: string[] = [
    'Intern',
    'Junior (SDE I)',
    'Mid-Level (SDE II)',
    'Senior (SDE III)',
    'Staff Engineer',
    'Engineering Manager',
  ];

  const handleSelect = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFormData((prev) => ({ ...prev, resume: file }));
      setError(null);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileRes = await profileApi.upsert({
        targetRole: formData.role,
        targetCompany: formData.company,
        level: formData.level,
      });

      if (!profileRes.success) {
        throw new Error(profileRes.error || 'Failed to save profile');
      }

      if (formData.resume) {
        const docRes = await documentApi.uploadResume(formData.resume);
        if (!docRes.success) {
          console.warn('Resume upload failed:', docRes.error);
        }
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100"
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
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-200/40 blur-[120px]"></div>
      </div>

      {/* --- MAIN GLASS CARD --- */}
      {/* UPDATED: Changed max-w-2xl to max-w-5xl for a wider layout */}
      <div className="relative z-10 w-full max-w-5xl px-4">
        {/* Progress Bar */}
        <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between px-2">
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? 'w-8 bg-indigo-400' : 'w-4 bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Step {step} of {totalSteps}
          </span>
        </div>

        <motion.div className="flex min-h-[600px] flex-col overflow-hidden rounded-[2rem] border border-white bg-white/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-12">
          {/* DYNAMIC CONTENT AREA */}
          <div className="flex flex-grow flex-col justify-center">
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
                  <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                      <Briefcase size={32} />
                    </div>
                    <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                      Target Role
                    </h2>
                    <p className="text-lg text-slate-500">
                      What position are you interviewing for?
                    </p>
                  </div>

                  {/* UPDATED GRID: grid-cols-2 md:grid-cols-4 */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleSelect('role', role)}
                        className={`flex h-full flex-col items-center justify-center gap-2 rounded-2xl border p-6 text-center text-sm font-semibold transition-all duration-200 ${
                          formData.role === role
                            ? 'scale-105 border-indigo-400 bg-indigo-400 text-white shadow-xl shadow-indigo-200'
                            : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50'
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
                  <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                      <Building2 size={32} />
                    </div>
                    <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                      Target Company
                    </h2>
                    <p className="text-lg text-slate-500">
                      Select a company style to mimic their interview process.
                    </p>
                  </div>

                  {/* UPDATED GRID: grid-cols-2 md:grid-cols-4 */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {companies.map((company) => (
                      <button
                        key={company}
                        onClick={() => handleSelect('company', company)}
                        className={`rounded-2xl border p-6 text-base font-semibold transition-all duration-200 ${
                          formData.company === company
                            ? 'scale-105 border-indigo-400 bg-indigo-400 text-white shadow-xl shadow-indigo-200'
                            : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50'
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
                  <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                      <Award size={32} />
                    </div>
                    <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                      Experience Level
                    </h2>
                    <p className="text-lg text-slate-500">
                      Choose the difficulty level for your questions.
                    </p>
                  </div>

                  {/* UPDATED GRID: grid-cols-1 md:grid-cols-3 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => handleSelect('level', level)}
                        className={`group flex items-center justify-between rounded-2xl border p-6 text-sm font-semibold transition-all duration-200 ${
                          formData.level === level
                            ? 'scale-105 border-indigo-400 bg-indigo-400 text-white shadow-xl shadow-indigo-200'
                            : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        {level}
                        {formData.level === level && <CheckCircle size={20} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

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
                  <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                      <FileText size={32} />
                    </div>
                    <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                      Upload Resume
                    </h2>
                    <p className="text-lg text-slate-500">
                      Optional: Let AI tailor questions to your CV.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`group mx-auto max-w-2xl cursor-pointer rounded-[2rem] border-3 border-dashed bg-slate-50/50 p-16 text-center transition-all ${
                      formData.resume
                        ? 'border-indigo-400 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-sm transition-all ${
                        formData.resume
                          ? 'bg-indigo-400 text-white'
                          : 'bg-white text-slate-400 group-hover:scale-110 group-hover:text-indigo-400'
                      }`}
                    >
                      {formData.resume ? <CheckCircle size={36} /> : <Upload size={36} />}
                    </div>
                    {formData.resume ? (
                      <>
                        <p className="mb-2 text-xl font-bold text-indigo-600">
                          {formData.resume.name}
                        </p>
                        <p className="text-slate-400">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <p className="mb-2 text-xl font-bold text-slate-700">Click to upload PDF</p>
                        <p className="text-slate-400">Maximum file size 10MB</p>
                      </>
                    )}
                  </div>

                  <div className="mt-8 text-center">
                    <button
                      onClick={handleFinish}
                      disabled={isLoading}
                      className="font-medium text-slate-400 transition-colors hover:text-indigo-400 hover:underline disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Skip for now'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8">
            <button
              onClick={handleBack}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-400 disabled:opacity-50 ${
                step === 1 ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            >
              <ArrowLeft size={20} /> Back
            </button>

            <button
              onClick={step === totalSteps ? handleFinish : handleNext}
              disabled={
                isLoading ||
                (step === 1 && !formData.role) ||
                (step === 2 && !formData.company) ||
                (step === 3 && !formData.level)
              }
              className="flex transform items-center gap-2 rounded-full bg-indigo-400 px-10 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 hover:bg-indigo-500 hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {step === totalSteps ? 'Finish Setup' : 'Next'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
