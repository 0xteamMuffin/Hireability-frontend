'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Code2,
  Cpu,
  Target,
  Zap,
  TrendingUp,
  Layout,
  Type,
  Check,
  ArrowRight,
} from 'lucide-react';
import { documentApi } from '@/lib/api';

interface ResumeScore {
  impact: number;
  ats: number;
  keywords: number;
  formatting: number;
  grammar: number;
  total: number;
}

interface ResumeReviewContent {
  summary: string;
  strengths: string[];
  actionableFeedback: string[];
}

interface AnalysisResult {
  scores: ResumeScore;
  review: ResumeReviewContent;
}

export const ResumeReviewPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    checkResume();
  }, []);

  const checkResume = async () => {
    try {
      const response = await documentApi.getResume();
      if (response && response.success && response.data) {
        setResumeData(response.data);
        setHasResume(true);

        const existingAnalysis = (response.data as any).analysis;
        if (existingAnalysis) {
          tryParseAnalysis(existingAnalysis);
        }
      } else {
        setHasResume(false);
      }
    } catch (error) {
      console.log('No resume found', error);
      setHasResume(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const file = e.target.files[0];

    try {
      const response = await documentApi.uploadResume(file);
      if (response && response.success && response.data) {
        setResumeData(response.data);
        setHasResume(true);

        handleAnalyze(response.data);
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const tryParseAnalysis = (data: any) => {
    try {
      if (typeof data === 'object' && data !== null) {
        setAnalysis(data);
        return;
      }

      if (typeof data === 'string') {
        const cleanJson = data
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const parsed = JSON.parse(cleanJson);
        setAnalysis(parsed);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }
  };

  const handleAnalyze = async (data: any) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await documentApi.getResumeReview();
      if (result.success && result.data) {
        tryParseAnalysis(result.data);
      } else {
        console.error('AI Error:', result.error);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('An error occurred connecting to AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ScoreBar = ({ label, value, icon: Icon, color }: any) => {
    const colorMap: Record<string, { text: string; bg: string }> = {
      indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500' },
      emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500' },
      amber: { text: 'text-amber-500', bg: 'bg-amber-500' },
      blue: { text: 'text-blue-500', bg: 'bg-blue-500' },
      purple: { text: 'text-purple-500', bg: 'bg-purple-500' },
    };

    const theme = colorMap[color] || colorMap.indigo;

    return (
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className={`flex items-center gap-2 text-sm font-bold ${theme.text}`}>
            <Icon size={16} />
            {label}
          </div>
          <span className="text-sm font-bold text-slate-900">{value}/100</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${theme.bg}`}
          />
        </div>
      </div>
    );
  };

  const CircularScore = ({ score }: { score: number }) => {
    const radius = 38;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90 transform">
          <circle
            stroke="#f1f5f9"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
          <motion.circle
            stroke="#6366f1"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-800">{score}</span>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Score
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={40} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Resume Review</h1>
          <p className="mt-1 text-slate-500">
            AI analysis based on your <strong>Goals</strong> and resume.
          </p>
        </div>
        {hasResume && (
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
            <CheckCircle size={16} /> Resume Uploaded
          </div>
        )}
      </header>

      {!hasResume ? (
        <section className="rounded-[2rem] border border-white bg-white/60 p-12 text-center shadow-sm backdrop-blur-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
            <Upload size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Upload your Resume</h2>
          <p className="mx-auto mb-8 max-w-md text-slate-500">
            Upload your PDF or DOCX resume. We will analyze it against the companies listed in your{' '}
            <strong>Goals</strong> section.
          </p>

          <div className="group relative inline-block">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            />
            <button className="flex items-center gap-2 rounded-xl bg-indigo-400 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all group-hover:bg-indigo-500 group-hover:shadow-indigo-300">
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Uploading...
                </>
              ) : (
                <>
                  <FileText size={20} /> Select File
                </>
              )}
            </button>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT COLUMN - STATS & ACTIONS */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-[2rem] border border-white bg-white/80 p-6 shadow-sm backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">My Resume</h3>
                  <p className="text-xs text-slate-400">
                    Status:{' '}
                    <span className="font-medium text-green-600">
                      {resumeData?.status || 'Uploaded'}
                    </span>
                  </p>
                </div>
              </div>

              {resumeData?.parsedData?.skills && Array.isArray(resumeData.parsedData.skills) && (
                <div className="mb-6">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                    <Code2 size={12} /> Detected Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.parsedData.skills.slice(0, 8).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {resumeData.parsedData.skills.length > 8 && (
                      <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-500">
                        +{resumeData.parsedData.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleAnalyze(resumeData)}
                disabled={isAnalyzing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
              >
                {isAnalyzing ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <RefreshCcw size={16} />
                )}
                Re-Analyze with Goals
              </button>
            </div>

            {resumeData?.confidence !== undefined && (
              <div className="flex items-center gap-4 rounded-[2rem] border border-emerald-100 bg-emerald-50/50 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Cpu size={20} />
                </div>
                <div>
                  <p className="font-bold text-emerald-800">Parser Confidence</p>
                  <p className="text-sm text-emerald-600">
                    {(resumeData.confidence * 100).toFixed(0)}% accuracy score
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - AI ANALYSIS */}
          <div className="lg:col-span-2">
            <div className="min-h-[500px] rounded-[2rem] border border-white bg-white/80 p-8 shadow-sm backdrop-blur-xl">
              {isAnalyzing ? (
                <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                    <Loader2 className="animate-spin text-indigo-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Analyzing against your Goals...
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Evaluating impact, ATS compatibility, and content.
                  </p>
                </div>
              ) : analysis ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
                  {/* 1. Header & Summary */}
                  <div className="flex flex-col items-center gap-8 border-b border-slate-100 pb-8 md:flex-row md:items-start">
                    <CircularScore score={analysis.scores.total} />
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="mb-2 text-2xl font-bold text-slate-800">Resume Audit</h2>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {analysis.review.summary}
                      </p>
                    </div>
                  </div>

                  {/* 2. Detailed Metrics */}
                  <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                    <ScoreBar
                      label="Impact & Content"
                      value={analysis.scores.impact}
                      icon={Target}
                      color="indigo"
                    />
                    <ScoreBar
                      label="ATS Compatibility"
                      value={analysis.scores.ats}
                      icon={Cpu}
                      color="emerald"
                    />
                    <ScoreBar
                      label="Keywords & Relevance"
                      value={analysis.scores.keywords}
                      icon={Zap}
                      color="amber"
                    />
                    <ScoreBar
                      label="Formatting & UX"
                      value={analysis.scores.formatting}
                      icon={Layout}
                      color="blue"
                    />
                    <ScoreBar
                      label="Grammar & Style"
                      value={analysis.scores.grammar}
                      icon={Type}
                      color="purple"
                    />
                  </div>

                  {/* 3. Strengths & Improvements */}
                  <div className="grid gap-6 pt-4 md:grid-cols-2">
                    {/* Strengths Card */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
                      <h3 className="mb-4 flex items-center gap-2 font-bold text-emerald-800">
                        <TrendingUp size={18} /> Key Strengths
                      </h3>
                      <ul className="space-y-3">
                        {analysis.review.strengths.map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700">
                            <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Feedback Card */}
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-6">
                      <h3 className="mb-4 flex items-center gap-2 font-bold text-amber-800">
                        <AlertCircle size={18} /> Actionable Feedback
                      </h3>
                      <ul className="space-y-3">
                        {analysis.review.actionableFeedback.map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700">
                            <ArrowRight size={16} className="mt-0.5 shrink-0 text-amber-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-20 text-center text-slate-400">
                  <p>Click "Re-Analyze" to generate a detailed audit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
