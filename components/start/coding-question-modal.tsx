'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Code, Send, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { vapiApi } from '@/lib/api';

interface CodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  interviewId: string;
  previousSystemPrompt: string;
  previousConversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  onResumeCall: (evaluationContext: { 
    score: number; 
    feedback: string; 
    passed: boolean;
    question: string;
    solution: string;
  }) => void;
}

const CodingQuestionModal: React.FC<CodingQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  interviewId,
  previousSystemPrompt,
  previousConversation,
  onResumeCall,
}) => {
  const [solution, setSolution] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [displayQuestion, setDisplayQuestion] = useState(question);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    passed: boolean;
  } | null>(null);

  // Use ref to track if we've already generated to prevent infinite loops
  const hasGeneratedRef = useRef(false);
  const isGeneratingRef = useRef(false);

  // Define generateQuestion before useEffect that uses it
  const generateQuestion = React.useCallback(async () => {
    // Guard against concurrent calls
    if (isGeneratingRef.current) {
      return;
    }
    
    isGeneratingRef.current = true;
    setGeneratingQuestion(true);
    try {
      console.log('[CodingQuestionModal] Generating question from transcript...');
      const result = await vapiApi.generateCodingQuestion({
        interviewId,
        transcript: previousConversation,
      });

      if (result.success && result.data) {
        console.log('[CodingQuestionModal] Question generated:', result.data.question.substring(0, 100));
        setDisplayQuestion(result.data.question);
      } else {
        console.error('[CodingQuestionModal] Failed to generate question:', result.error);
        setDisplayQuestion('Unable to generate coding question. Please try again.');
        hasGeneratedRef.current = false; // Allow retry on error
      }
    } catch (error) {
      console.error('[CodingQuestionModal] Error generating question:', error);
      setDisplayQuestion('An error occurred while generating the question. Please try again.');
      hasGeneratedRef.current = false; // Allow retry on error
    } finally {
      setGeneratingQuestion(false);
      isGeneratingRef.current = false;
    }
  }, [interviewId, previousConversation]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasGeneratedRef.current = false;
      isGeneratingRef.current = false;
    }
  }, [isOpen]);

  // Initialize displayQuestion from prop when modal opens
  useEffect(() => {
    if (isOpen && question && !displayQuestion) {
      setDisplayQuestion(question);
    }
  }, [isOpen, question, displayQuestion]);

  // Generate question when modal opens if question is empty - only once
  useEffect(() => {
    if (
      isOpen && 
      !displayQuestion && 
      !hasGeneratedRef.current && 
      !isGeneratingRef.current &&
      previousConversation.length > 0
    ) {
      hasGeneratedRef.current = true;
      generateQuestion();
    }
  }, [isOpen, displayQuestion, generateQuestion, previousConversation.length]);

  const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
  ];

  const handleSubmit = async () => {
    if (!solution.trim() || submitting || !displayQuestion) return;

    setSubmitting(true);
    try {
      console.log('[CodingQuestionModal] Submitting solution:', {
        interviewId,
        questionLength: displayQuestion.length,
        solutionLength: solution.length,
        language,
      });

      const evalResult = await vapiApi.evaluateCodingSolution({
        interviewId,
        question: displayQuestion,
        solution,
        language,
      });

      console.log('[CodingQuestionModal] Evaluation result:', evalResult);

      if (evalResult.success && evalResult.data) {
        const evaluationData = evalResult.data;
        setEvaluation(evaluationData);

        // Wait 3 seconds to show evaluation, then resume the paused call
        setTimeout(() => {
          console.log('[CodingQuestionModal] Resuming paused call with evaluation');
          onResumeCall({
            score: evaluationData.score,
            feedback: evaluationData.feedback,
            passed: evaluationData.passed,
            question: displayQuestion,
            solution: solution,
          });
          onClose();
        }, 3000);
      } else {
        console.error('[CodingQuestionModal] Evaluation failed:', evalResult.error);
      }
    } catch (error) {
      console.error('[CodingQuestionModal] Failed to evaluate solution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#1e1e1e] rounded-lg border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2">
              <Code size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Coding Question</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Question */}
          <div className="bg-[#252526] rounded-lg p-4 border border-white/5">
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Question:</h3>
            {generatingQuestion ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 size={16} className="animate-spin" />
                <p>Generating coding question from interview transcript...</p>
              </div>
            ) : (
              <div className="text-zinc-200 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Customize code blocks
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <pre className="bg-[#1e1e1e] rounded p-3 overflow-x-auto my-2 border border-white/5">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Customize headings
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold mb-1 mt-2 text-zinc-100">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 mt-2 text-zinc-200">{children}</h4>,
                    // Customize lists
                    ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 ml-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 ml-4">{children}</ol>,
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    // Customize paragraphs
                    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                    // Customize blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-zinc-500 pl-4 my-2 italic text-zinc-300">
                        {children}
                      </blockquote>
                    ),
                    // Customize tables
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-white/10">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-white/10 px-4 py-2 bg-[#1e1e1e] text-left font-semibold text-zinc-200">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-white/10 px-4 py-2 text-zinc-300">
                        {children}
                      </td>
                    ),
                    // Customize horizontal rules
                    hr: () => <hr className="my-4 border-white/10" />,
                    // Customize strong/bold
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    // Customize emphasis/italic
                    em: ({ children }) => <em className="italic">{children}</em>,
                  }}
                >
                  {displayQuestion || 'Loading question...'}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Evaluation Result */}
          {evaluation && (
            <div
              className={`rounded-lg p-4 border ${
                evaluation.passed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-lg font-semibold ${
                    evaluation.passed ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  Score: {evaluation.score}/10
                </span>
                <span
                  className={`text-sm ${
                    evaluation.passed ? 'text-green-300' : 'text-yellow-300'
                  }`}
                >
                  {evaluation.passed ? 'Passed' : 'Needs Improvement'}
                </span>
              </div>
              <p className="text-zinc-200 mb-3">{evaluation.feedback}</p>
              {evaluation.strengths.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-green-300 mb-1">Strengths:</p>
                  <ul className="list-disc list-inside text-sm text-zinc-300">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {evaluation.improvements.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-yellow-300 mb-1">
                    Areas for Improvement:
                  </p>
                  <ul className="list-disc list-inside text-sm text-zinc-300">
                    {evaluation.improvements.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-zinc-400 mt-3">Resuming interview call...</p>
            </div>
          )}

          {/* Code Editor */}
          {!evaluation && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Your Solution:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded border border-white/5 bg-[#2d2d2d] px-3 py-1.5 text-sm text-zinc-300 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-64 border border-white/10 rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  language={language}
                  value={solution}
                  onChange={(value) => setSolution(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!evaluation && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!solution.trim() || submitting || !displayQuestion || generatingQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Solution
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingQuestionModal;

