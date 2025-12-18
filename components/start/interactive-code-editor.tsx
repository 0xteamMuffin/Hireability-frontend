/**
 * Interactive Code Editor - Revamped
 * Real-time code editing with WebSocket sync and live execution results
 */

"use client"
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
import { codingApi } from '@/lib/api';

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
  // Store state
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

  // Local state
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

  // Update starter code when problem changes (starterCode is now a string, not Record)
  useEffect(() => {
    if (codingProblem?.starterCode) {
      const starterCode = codingProblem.starterCode;
      if (!currentCode || currentCode.includes('// Write your') || currentCode.trim() === '') {
        setCurrentCode(starterCode);
      }
    }
  }, [codingProblem, currentCode, setCurrentCode]);

  // Handle editor changes with debounced sync
  const handleEditorChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCurrentCode(newCode);

    // Debounce WebSocket sync
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onCodeChange?.(newCode, codeLanguage);
    }, 500);
  }, [codeLanguage, onCodeChange, setCurrentCode]);

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setCodeLanguage(lang);
    // Note: starterCode is now a single string for the initially selected language
    // Backend picks the language, so we don't auto-update starter code on language change
  };

  // Get hint
  const handleGetHint = async () => {
    if (!codingProblem || loadingHint) return;

    // First try built-in hints
    if (codingProblem.hintsAvailable && hintsUsed < codingProblem.hintsAvailable.length) {
      setHint(codingProblem.hintsAvailable[hintsUsed]);
      setHintsUsed(prev => prev + 1);
      return;
    }

    // Then get AI hint
    setLoadingHint(true);
    try {
      const resp = await codingApi.getHint(
        codeRef.current,
        codeLanguage,
        codingProblem.problemDescription
      );
      if (resp.success && resp.data) {
        setHint(resp.data.hint);
        setHintsUsed(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to get hint:', err);
    } finally {
      setLoadingHint(false);
    }
  };

  // Run code (local execution via backend)
  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setShowOutput(true);
    setLocalOutput(null);

    try {
      // Use the coding API to run the code
      const resp = await codingApi.runCode?.({
        code: codeRef.current,
        language: codeLanguage,
      });
      
      if (resp?.success && resp.data) {
        setLocalOutput(resp.data.output || resp.data.error || 'No output');
      } else {
        setLocalOutput(resp?.error || 'Execution failed');
      }
    } catch (err) {
      setLocalOutput('Failed to execute code');
    } finally {
      setRunning(false);
    }
  };

  // Submit code for evaluation
  const handleSubmit = async () => {
    if (!roundId || submitting) return;

    setSubmitting(true);
    try {
      const resp = await codingApi.submitCode({
        roundId,
        code: codeRef.current,
        language: codeLanguage,
      });

      if (resp.success && resp.data) {
        setShowOutput(true);
      }
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset code
  const handleReset = () => {
    if (codingProblem?.starterCode) {
      setCurrentCode(codingProblem.starterCode);
    } else {
      setCurrentCode('// Write your solution here\n');
    }
    setHint(null);
    setLocalOutput(null);
  };

  // Auto-open for coding phase
  useEffect(() => {
    if (isCodingPhase && codingProblem && !isCodeEditorOpen) {
      setCodeEditorOpen(true);
    }
  }, [isCodingPhase, codingProblem, isCodeEditorOpen, setCodeEditorOpen]);

  // Get difficulty color
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
        className={`fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-8 h-16 bg-[#252526] border border-white/10 rounded-r-lg text-zinc-400 hover:text-white hover:bg-[#2d2d2d] transition-all duration-300 shadow-lg group ${
          isCodeEditorOpen ? 'left-[55%]' : 'left-0'
        }`}
        aria-label={isCodeEditorOpen ? 'Close code editor' : 'Open code editor'}
      >
        {isCodeEditorOpen ? (
          <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Code size={16} />
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </button>

      {/* Code Editor Panel */}
      <div 
        className={`fixed top-0 left-0 h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] z-40 ${
          isCodeEditorOpen ? 'w-[55%]' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="relative h-full w-full bg-[#1e1e1e] border-r border-white/10 flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-[#252526] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <Code size={18} className="text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">
                {codingProblem ? 'Coding Challenge' : 'Code Editor'}
              </h3>
              {isCodingPhase && (
                <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                  Live Coding
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#2d2d2d] text-zinc-300 text-xs px-3 py-1.5 rounded border border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
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
          <div className={`border-b border-white/10 bg-[#1a1a1a] transition-all duration-300 ${
            showProblem ? 'max-h-72' : 'max-h-10'
          } overflow-hidden`}>
            <button
              onClick={() => setShowProblem(!showProblem)}
              className="w-full px-4 py-2 flex items-center justify-between text-sm text-zinc-300 hover:bg-white/5"
            >
              <span className="font-medium truncate">{codingProblem.problemTitle}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-xs border ${getDifficultyColor(codingProblem.difficulty)}`}>
                  {codingProblem.difficulty}
                </span>
                {showProblem ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {showProblem && (
              <div className="px-4 pb-4 max-h-56 overflow-y-auto">
                <p className="text-sm text-zinc-400 whitespace-pre-wrap mb-3">
                  {codingProblem.problemDescription}
                </p>

                {/* Examples */}
                {codingProblem.examples && codingProblem.examples.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 font-medium">Examples:</p>
                    {codingProblem.examples.map((ex, i) => (
                      <div key={i} className="bg-[#252526] rounded p-2 text-xs font-mono">
                        <p className="text-zinc-400">
                          <span className="text-zinc-500">Input:</span> {ex.input}
                        </p>
                        <p className="text-zinc-400">
                          <span className="text-zinc-500">Output:</span> {ex.output}
                        </p>
                        {ex.explanation && (
                          <p className="text-zinc-500 mt-1">{ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {codingProblem.constraints && codingProblem.constraints.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Constraints:</p>
                    <ul className="text-xs text-zinc-400 space-y-0.5">
                      {codingProblem.constraints.map((c, i) => (
                        <li key={i} className="pl-2 relative before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:bg-zinc-600 before:rounded-full">
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
          <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-200">{hint}</p>
              <button
                onClick={() => setHint(null)}
                className="text-amber-400 hover:text-amber-200 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 min-h-0">
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
              <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-zinc-500">
                <Loader2 className="animate-spin" size={24} />
              </div>
            }
          />
        </div>

        {/* Output Panel (Collapsible) */}
        {showOutput && (
          <div className="border-t border-white/10 bg-[#1a1a1a] max-h-48 overflow-hidden flex flex-col">
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/5">
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
                <div className={`mb-2 p-2 rounded ${
                  codeExecutionResult.success 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {codeExecutionResult.success ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <X size={14} className="text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      codeExecutionResult.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {codeExecutionResult.success ? 'Success' : 'Error'}
                    </span>
                    {codeExecutionResult.executionTimeMs && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock size={10} />
                        {codeExecutionResult.executionTimeMs}ms
                      </span>
                    )}
                  </div>
                  
                  {codeExecutionResult.output && (
                    <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap">
                      {codeExecutionResult.output}
                    </pre>
                  )}
                  
                  {codeExecutionResult.error && (
                    <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                      {codeExecutionResult.error}
                    </pre>
                  )}

                  {/* Test results */}
                  {codeExecutionResult.testResults && codeExecutionResult.testResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-zinc-400">
                        Tests: {codeExecutionResult.passedTests}/{codeExecutionResult.totalTests} passed
                      </p>
                      {codeExecutionResult.testResults.map((test, i) => (
                        <div key={i} className={`text-xs p-1.5 rounded ${
                          test.passed ? 'bg-green-500/5' : 'bg-red-500/5'
                        }`}>
                          <span className={test.passed ? 'text-green-400' : 'text-red-400'}>
                            {test.passed ? '✓' : '✗'}
                          </span>
                          <span className="text-zinc-400 ml-2">
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
                <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap">
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
        <div className="h-12 px-3 border-t border-white/10 bg-[#252526] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              Reset
            </button>

            {codingProblem && (
              <button
                onClick={handleGetHint}
                disabled={loadingHint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-amber-400 transition-colors disabled:opacity-50"
              >
                {loadingHint ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Lightbulb size={14} />
                )}
                Hint
                {codingProblem.hintsAvailable && hintsUsed < codingProblem.hintsAvailable.length && (
                  <span className="text-zinc-500">({codingProblem.hintsAvailable.length - hintsUsed})</span>
                )}
              </button>
            )}

            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-green-400 transition-colors disabled:opacity-50"
            >
              {running ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Run
            </button>
          </div>

          <div className="flex items-center gap-2">
            {roundId && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
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
