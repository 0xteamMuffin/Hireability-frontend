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
} from "lucide-react";
import { documentApi } from "@/lib/api";
import { generateResumeReview } from "@/lib/api/resume";
import ReactMarkdown from "react-markdown"; // Import React Markdown

export const ResumeReviewPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [review, setReview] = useState<string | null>(null);
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
        handleAnalyze(response.data);
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

  const handleAnalyze = async (data: any) => {
    if (!data) return;
    setIsAnalyzing(true);

    try {
      const result = await generateResumeReview(data);
      if (result.success && result.data) {
        setReview(result.data);
      } else {
        console.error("AI Error:", result.error);
        alert("AI could not review the document. Check console for details.");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("An error occurred while connecting to the AI service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

            <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6">
              <h4 className="flex items-center gap-2 font-bold text-blue-700 mb-2 text-sm">
                <AlertCircle size={16} /> Pro Tip
              </h4>
              <p className="text-xs text-blue-600/80 leading-relaxed">
                Tailor your resume keywords to the specific Job Description for
                better ATS scores.
              </p>
            </div>
          </div>

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
                    Evaluating skills, projects, and impact.
                  </p>
                </div>
              ) : review ? (
                <div className="prose prose-slate prose-lg max-w-none">
                  {/* --- UPDATED FORMATTING CODE --- */}
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-xl font-bold text-indigo-600 mt-6 mb-3 flex items-center gap-2"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-lg font-semibold text-slate-700 mt-4 mb-2"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="text-slate-600 mb-4 leading-relaxed"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc list-inside space-y-2 mb-4 text-slate-600"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="ml-4" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <span className="font-bold text-slate-800" {...props} />
                      ),
                    }}
                  >
                    {review}
                  </ReactMarkdown>
                  {/* --- END FORMATTING CODE --- */}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                  <p>Click "Re-Analyze" to generate a review.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
