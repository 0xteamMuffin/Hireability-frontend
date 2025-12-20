'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Code, Send, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { vapiApi } from '@/lib/api';

interface CodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  interviewId: string;
  previousSystemPrompt: string;
  previousConversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  onResumeCall: (context: { systemPrompt: string; firstMessage: string }) => void;
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
        setEvaluation(evalResult.data);

        console.log('[CodingQuestionModal] Building resume context...');
        
        // Build resume context
        const resumeResult = await vapiApi.buildResumeCallContext({
          interviewId,
          previousSystemPrompt,
          previousConversation,
          evaluation: {
            ...evalResult.data,
            question: displayQuestion,
            solution: solution,
          },
        });

        console.log('[CodingQuestionModal] Resume context result:', resumeResult);

        if (resumeResult.success && resumeResult.data) {
          // Wait 5 seconds to show evaluation, then resume call
          setTimeout(() => {
            console.log('[CodingQuestionModal] Resuming call with context:', {
              systemPromptLength: resumeResult.data.systemPrompt?.length || 0,
              systemPromptPreview: resumeResult.data.systemPrompt?.substring(0, 300) || 'N/A',
              systemPromptContainsContinuation: resumeResult.data.systemPrompt?.includes('CONTINUATION CONTEXT') || false,
              systemPromptContainsEvaluation: resumeResult.data.systemPrompt?.includes('Coding Question Evaluation') || false,
              firstMessage: resumeResult.data.firstMessage?.substring(0, 150) || 'N/A',
            });
            onResumeCall(resumeResult.data);
            onClose();
          }, 5000);
        } else {
          console.error('[CodingQuestionModal] Failed to build resume context:', resumeResult.error);
        }
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
              <p className="text-zinc-200 whitespace-pre-wrap">{displayQuestion || 'Loading question...'}</p>
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

