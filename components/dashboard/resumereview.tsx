"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { documentApi } from "@/lib/api";

// --- Types for the AI Analysis Structure ---
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

  // State to hold the structured analysis object
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
        // Check if analysis already exists on the backend object
        // We cast to 'any' to avoid the TypeScript error if your interface isn't updated yet
        const existingAnalysis = (response.data as any).analysis;
        if (existingAnalysis) {
          tryParseAnalysis(existingAnalysis);
        }
      } else {
        setHasResume(false);
      }
    } catch (error) {
      console.log("No resume found or API error:", error);
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
        // Trigger analysis automatically after upload if desired, or let user click
        handleAnalyze(response.data);
      } else {
        alert("Upload failed. Server returned unsuccessful response.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to safely parse Gemini JSON response (handles potential markdown wrapping)
  const tryParseAnalysis = (data: any) => {
    try {
      // If it's already an object, set it directly
      if (typeof data === "object" && data !== null) {
        setAnalysis(data);
        return;
      }

      // If it's a string, try to clean markdown code blocks and parse
      if (typeof data === "string") {
        const cleanJson = data
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleanJson);
        setAnalysis(parsed);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }
  };

  const handleAnalyze = async (data: any) => {
    setIsAnalyzing(true);
    setAnalysis(null); // Clear previous results while loading

    try {
      const result = await documentApi.getResumeReview();
      if (result.success && result.data) {
        tryParseAnalysis(result.data);
      } else {
        console.error("AI Error:", result.error);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("An error occurred while connecting to the AI service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- SUB-COMPONENTS ---

  // 1. ScoreBar with explicit color mapping for Tailwind JIT
  const ScoreBar = ({ label, value, icon: Icon, color }: any) => {
    const colorMap: Record<string, { text: string; bg: string }> = {
      indigo: { text: "text-indigo-500", bg: "bg-indigo-500" },
      emerald: { text: "text-emerald-500", bg: "bg-emerald-500" },
      amber: { text: "text-amber-500", bg: "bg-amber-500" },
      blue: { text: "text-blue-500", bg: "bg-blue-500" },
      purple: { text: "text-purple-500", bg: "bg-purple-500" },
    };

    const theme = colorMap[color] || colorMap.indigo;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div
            className={`flex items-center gap-2 text-sm font-bold ${theme.text}`}
          >
            <Icon size={16} />
            {label}
          </div>
          <span className="text-sm font-bold text-slate-900">{value}/100</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${theme.bg}`}
          />
        </div>
      </div>
    );
  };

  // 2. Thicker Circular Score
  const CircularScore = ({ score }: { score: number }) => {
    const radius = 38;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#f1f5f9" // slate-100
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
          <motion.circle
            stroke="#6366f1" // indigo-500
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={circumference + " " + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {score}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Score
          </span>
        </div>
      </div>
    );
  };

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
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
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Resume Review
          </h1>
          <p className="text-slate-500 mt-1">
            AI-powered insights to optimize your CV.
          </p>
        </div>
        {hasResume && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
            <CheckCircle size={16} /> Resume Uploaded
          </div>
        )}
      </header>

      {!hasResume ? (
        <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <Upload size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Upload your Resume
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Upload your PDF or DOCX resume to get an instant AI evaluation and
            score.
          </p>

          <div className="relative inline-block group">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <button className="bg-indigo-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 group-hover:bg-indigo-500 group-hover:shadow-indigo-300 transition-all flex items-center gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - STATS & ACTIONS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">My Resume</h3>
                  <p className="text-xs text-slate-400">
                    Status:{" "}
                    <span className="text-green-600 font-medium">
                      {resumeData?.status || "Uploaded"}
                    </span>
                  </p>
                </div>
              </div>

              {resumeData?.parsedData?.skills &&
                Array.isArray(resumeData.parsedData.skills) && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      <Code2 size={12} /> Detected Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.parsedData.skills
                        .slice(0, 8)
                        .map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      {resumeData.parsedData.skills.length > 8 && (
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-500 text-xs rounded-md">
                          +{resumeData.parsedData.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

              <button
                onClick={() => handleAnalyze(resumeData)}
                disabled={isAnalyzing}
                className="w-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-500 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {isAnalyzing ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <RefreshCcw size={16} />
                )}
                Re-Analyze
              </button>
            </div>

            {resumeData?.confidence !== undefined && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Cpu size={20} />
                </div>
                <div>
                  <p className="text-emerald-800 font-bold">
                    Parser Confidence
                  </p>
                  <p className="text-sm text-emerald-600">
                    {(resumeData.confidence * 100).toFixed(0)}% accuracy score
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - AI ANALYSIS */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-sm min-h-[500px]">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Loader2
                      className="animate-spin text-indigo-400"
                      size={32}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Gemini is analyzing your data...
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Evaluating impact, ATS compatibility, and content.
                  </p>
                </div>
              ) : analysis ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* 1. Header & Summary */}
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-slate-100 pb-8">
                    <CircularScore score={analysis.scores.total} />
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Resume Audit
                      </h2>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {analysis.review.summary}
                      </p>
                    </div>
                  </div>

                  {/* 2. Detailed Metrics */}
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
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
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    {/* Strengths Card */}
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6">
                      <h3 className="flex items-center gap-2 font-bold text-emerald-800 mb-4">
                        <TrendingUp size={18} /> Key Strengths
                      </h3>
                      <ul className="space-y-3">
                        {analysis.review.strengths.map((point, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-slate-700"
                          >
                            <Check
                              size={16}
                              className="text-emerald-500 mt-0.5 shrink-0"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Feedback Card */}
                    <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-6">
                      <h3 className="flex items-center gap-2 font-bold text-amber-800 mb-4">
                        <AlertCircle size={18} /> Actionable Feedback
                      </h3>
                      <ul className="space-y-3">
                        {analysis.review.actionableFeedback.map((point, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-slate-700"
                          >
                            <ArrowRight
                              size={16}
                              className="text-amber-500 mt-0.5 shrink-0"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
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
