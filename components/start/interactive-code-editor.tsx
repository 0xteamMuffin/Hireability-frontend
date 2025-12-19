/**
 * Interactive Code Editor - Revamped
 * Real-time code editing with WebSocket sync and live execution results
 */

'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Play,
  Lightbulb,
  Send,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Terminal,
  Clock,
  Zap,
} from 'lucide-react';
import { useInterviewStore, selectIsCodingPhase } from '@/lib/stores/interview-store';
import { Difficulty } from '@/lib/types/interview-state';
import { vapiApi } from '@/lib/api';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

interface InteractiveCodeEditorProps {
  roundId?: string;
  interviewId?: string;
  onCodeChange?: (code: string, language: string) => void;
  isInterviewActive?: boolean;
}

const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({
  roundId,
  interviewId,
  onCodeChange,
  isInterviewActive = false,
}) => {
  const {
    codingProblem,
    codeExecutionResult,
    currentCode,
    codeLanguage,
    isCodeEditorOpen,
    setCurrentCode,
    setCodeLanguage,
    setCodeEditorOpen,
  } = useInterviewStore();

  const isCodingPhase = useInterviewStore(selectIsCodingPhase);

  const [showProblem, setShowProblem] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [localOutput, setLocalOutput] = useState<string | null>(null);

  const codeRef = useRef(currentCode);
  codeRef.current = currentCode;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (codingProblem?.starterCode) {
      const starterCode = codingProblem.starterCode;
      if (!currentCode || currentCode.includes('')) {
        setCurrentCode(starterCode);
      }
    }
  }, [codingProblem, currentCode, setCurrentCode]);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || '';
      setCurrentCode(newCode);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onCodeChange?.(newCode, codeLanguage);
      }, 500);
    },
    [codeLanguage, onCodeChange, setCurrentCode],
  );

  const handleLanguageChange = (lang: string) => {
    setCodeLanguage(lang);
  };

  const handleGetHint = async () => {
    if (!codingProblem || loadingHint) return;

    if (codingProblem.hintsAvailable && hintsUsed < codingProblem.hintsAvailable.length) {
      setHint(codingProblem.hintsAvailable[hintsUsed]);
      setHintsUsed((prev) => prev + 1);
      return;
    }

    setLoadingHint(true);
    try {
      if (!interviewId) {
        setHint('Hint is unavailable: missing interviewId');
        return;
      }

      const resp = await vapiApi.getCodingHint({ interviewId });
      if (resp.success && resp.data) {
        setHint(resp.data.hint);
        setHintsUsed((prev) => prev + 1);
      } else {
        setHint(resp.error || 'Failed to get hint');
      }
    } catch (err) {
      console.error('Failed to get hint:', err);
      setHint('Failed to get hint');
    } finally {
      setLoadingHint(false);
    }
  };

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setShowOutput(true);
    setLocalOutput(null);

    try {
      if (!interviewId) {
        setLocalOutput('Run is unavailable: missing interviewId');
        return;
      }

      const resp = await vapiApi.executeCoding({
        interviewId,
        code: codeRef.current,
        language: codeLanguage,
      });

      if (resp.success && resp.data) {
        const r = resp.data.result;
        const passed = r.testResults?.filter((t) => t.passed).length || 0;
        const total = r.testResults?.length || 0;
        setLocalOutput(
          r.output || r.error || (total ? `${passed}/${total} tests passed` : 'No output'),
        );
      } else {
        setLocalOutput(resp.error || 'Execution failed');
      }
    } catch (err) {
      setLocalOutput('Failed to execute code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!interviewId || submitting) return;

    setSubmitting(true);
    try {
      const resp = await vapiApi.executeCoding({
        interviewId,
        code: codeRef.current,
        language: codeLanguage,
      });

      if (resp.success) {
        setShowOutput(true);
      } else {
        setLocalOutput(resp.error || 'Submit failed');
      }
    } catch (err) {
      console.error('Submit failed:', err);
      setLocalOutput('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (codingProblem?.starterCode) {
      setCurrentCode(codingProblem.starterCode);
    } else {
      setCurrentCode('');
    }
    setHint(null);
    setLocalOutput(null);
  };

  useEffect(() => {
    if (isCodingPhase && codingProblem && !isCodeEditorOpen) {
      setCodeEditorOpen(true);
    }
  }, [isCodingPhase, codingProblem, isCodeEditorOpen, setCodeEditorOpen]);

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case Difficulty.MEDIUM:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case Difficulty.HARD:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setCodeEditorOpen(!isCodeEditorOpen)}
        className={`group fixed top-1/2 z-50 flex h-16 w-8 -translate-y-1/2 items-center justify-center rounded-r-lg border border-white/10 bg-[#252526] text-zinc-400 shadow-lg transition-all duration-300 hover:bg-[#2d2d2d] hover:text-white ${
          isCodeEditorOpen ? 'left-[55%]' : 'left-0'
        }`}
        aria-label={isCodeEditorOpen ? 'Close code editor' : 'Open code editor'}
      >
        {isCodeEditorOpen ? (
          <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Code size={16} />
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </button>

      {/* Code Editor Panel */}
      <div
        className={`fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          isCodeEditorOpen ? 'w-[55%]' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden border-r border-white/10 bg-[#1e1e1e] shadow-2xl">
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#252526] px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-1.5">
                <Code size={18} className="text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
                {codingProblem ? 'Coding Challenge' : 'Code Editor'}
              </h3>
              {isCodingPhase && (
                <span className="rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                  Live Coding
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded border border-white/5 bg-[#2d2d2d] px-3 py-1.5 text-xs text-zinc-300 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problem Description (Collapsible) */}
          {codingProblem && (
            <div
              className={`border-b border-white/10 bg-[#1a1a1a] transition-all duration-300 ${
                showProblem ? 'max-h-72' : 'max-h-10'
              } overflow-hidden`}
            >
              <button
                onClick={() => setShowProblem(!showProblem)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
              >
                <span className="truncate font-medium">{codingProblem.problemTitle}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded border px-2 py-0.5 text-xs ${getDifficultyColor(codingProblem.difficulty)}`}
                  >
                    {codingProblem.difficulty}
                  </span>
                  {showProblem ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {showProblem && (
                <div className="max-h-56 overflow-y-auto px-4 pb-4">
                  <p className="mb-3 text-sm whitespace-pre-wrap text-zinc-400">
                    {codingProblem.problemDescription}
                  </p>

                  {/* Examples */}
                  {codingProblem.examples && codingProblem.examples.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-zinc-500">Examples:</p>
                      {codingProblem.examples.map((ex, i) => (
                        <div key={i} className="rounded bg-[#252526] p-2 font-mono text-xs">
                          <p className="text-zinc-400">
                            <span className="text-zinc-500">Input:</span> {ex.input}
                          </p>
                          <p className="text-zinc-400">
                            <span className="text-zinc-500">Output:</span> {ex.output}
                          </p>
                          {ex.explanation && <p className="mt-1 text-zinc-500">{ex.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {codingProblem.constraints && codingProblem.constraints.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-medium text-zinc-500">Constraints:</p>
                      <ul className="space-y-0.5 text-xs text-zinc-400">
                        {codingProblem.constraints.map((c, i) => (
                          <li
                            key={i}
                            className="relative pl-2 before:absolute before:top-1.5 before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-zinc-600"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hint Display */}
          {hint && (
            <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-sm text-amber-200">{hint}</p>
                <button
                  onClick={() => setHint(null)}
                  className="shrink-0 text-amber-400 hover:text-amber-200"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Editor Area */}
          <div className="min-h-0 flex-1">
            <Editor
              height="100%"
              language={codeLanguage}
              value={currentCode}
              theme="vs-dark"
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                wordWrap: 'on',
                tabSize: 2,
              }}
              loading={
                <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-zinc-500">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              }
            />
          </div>

          {/* Output Panel (Collapsible) */}
          {showOutput && (
            <div className="flex max-h-48 flex-col overflow-hidden border-t border-white/10 bg-[#1a1a1a]">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Terminal size={14} />
                  <span>Output</span>
                </div>
                <button
                  onClick={() => setShowOutput(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {/* Execution result from socket */}
                {codeExecutionResult && (
                  <div
                    className={`mb-2 rounded p-2 ${
                      codeExecutionResult.success
                        ? 'border border-green-500/20 bg-green-500/10'
                        : 'border border-red-500/20 bg-red-500/10'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      {codeExecutionResult.success ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <X size={14} className="text-red-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          codeExecutionResult.success ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {codeExecutionResult.success ? 'Success' : 'Error'}
                      </span>
                      {codeExecutionResult.executionTimeMs && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock size={10} />
                          {codeExecutionResult.executionTimeMs}ms
                        </span>
                      )}
                    </div>

                    {codeExecutionResult.output && (
                      <pre className="font-mono text-xs whitespace-pre-wrap text-zinc-300">
                        {codeExecutionResult.output}
                      </pre>
                    )}

                    {codeExecutionResult.error && (
                      <pre className="font-mono text-xs whitespace-pre-wrap text-red-300">
                        {codeExecutionResult.error}
                      </pre>
                    )}

                    {/* Test results */}
                    {codeExecutionResult.testResults &&
                      codeExecutionResult.testResults.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-zinc-400">
                            Tests: {codeExecutionResult.passedTests}/
                            {codeExecutionResult.totalTests} passed
                          </p>
                          {codeExecutionResult.testResults.map((test, i) => (
                            <div
                              key={i}
                              className={`rounded p-1.5 text-xs ${
                                test.passed ? 'bg-green-500/5' : 'bg-red-500/5'
                              }`}
                            >
                              <span className={test.passed ? 'text-green-400' : 'text-red-400'}>
                                {test.passed ? '✓' : '✗'}
                              </span>
                              <span className="ml-2 text-zinc-400">
                                Input: {test.input} → Expected: {test.expectedOutput}
                                {!test.passed && `, Got: ${test.actualOutput}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {/* Local output */}
                {localOutput && !codeExecutionResult && (
                  <pre className="font-mono text-xs whitespace-pre-wrap text-zinc-300">
                    {localOutput}
                  </pre>
                )}

                {/* Loading state */}
                {running && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">Running...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex h-12 shrink-0 items-center justify-between border-t border-white/10 bg-[#252526] px-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-red-400"
              >
                <Trash2 size={14} />
                Reset
              </button>

              {codingProblem && (
                <button
                  onClick={handleGetHint}
                  disabled={loadingHint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-amber-400 disabled:opacity-50"
                >
                  {loadingHint ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Lightbulb size={14} />
                  )}
                  Hint
                  {codingProblem.hintsAvailable &&
                    hintsUsed < codingProblem.hintsAvailable.length && (
                      <span className="text-zinc-500">
                        ({codingProblem.hintsAvailable.length - hintsUsed})
                      </span>
                    )}
                </button>
              )}

              <button
                onClick={handleRun}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-green-400 disabled:opacity-50"
              >
                {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Run
              </button>
            </div>

            <div className="flex items-center gap-2">
              {roundId && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-500 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InteractiveCodeEditor;
