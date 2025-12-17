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
  ChevronUp
} from 'lucide-react';
import { codingApi } from '@/lib/api';
import { CodingProblem, CodeEvaluationResult, Difficulty } from '@/lib/types';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
];

interface InteractiveCodeEditorProps {
  roundId?: string;
  problem?: CodingProblem;
  onCodeChange?: (code: string, language: string) => void;
  onSubmit?: (result: CodeEvaluationResult) => void;
  isInterviewActive?: boolean;
}

const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({
  roundId,
  problem: initialProblem,
  onCodeChange,
  onSubmit,
  isInterviewActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your code here...');
  const [problem, setProblem] = useState<CodingProblem | null>(initialProblem || null);
  const [showProblem, setShowProblem] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [evaluation, setEvaluation] = useState<CodeEvaluationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  const codeRef = useRef(code);
  codeRef.current = code;

  // Load problem on mount or when roundId changes
  useEffect(() => {
    if (initialProblem) {
      setProblem(initialProblem);
      if (initialProblem.starterCode?.[language]) {
        setCode(initialProblem.starterCode[language]);
      }
    }
  }, [initialProblem, language]);

  // Update starter code when language changes
  useEffect(() => {
    if (problem?.starterCode?.[language] && code.includes('// Write your code here')) {
      setCode(problem.starterCode[language]);
    }
  }, [language, problem]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode, language);
  }, [language, onCodeChange]);

  const handleGetHint = async () => {
    if (!problem || loadingHint) return;
    
    // First try built-in hints
    if (problem.hints && hintsUsed < problem.hints.length) {
      setHint(problem.hints[hintsUsed]);
      setHintsUsed(prev => prev + 1);
      return;
    }
    
    // Then get AI hint
    setLoadingHint(true);
    try {
      const resp = await codingApi.getHint(
        codeRef.current,
        language,
        problem.description
      );
      if (resp.success && resp.data) {
        setHint(resp.data.hint);
      }
    } catch (err) {
      console.error('Failed to get hint:', err);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmit = async () => {
    if (!roundId || submitting) return;
    
    setSubmitting(true);
    setEvaluation(null);
    
    try {
      const resp = await codingApi.submitCode({
        roundId,
        code: codeRef.current,
        language,
      });
      
      if (resp.success && resp.data) {
        setEvaluation(resp.data);
        onSubmit?.(resp.data);
      }
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    } else {
      setCode('// Write your code here...');
    }
    setEvaluation(null);
    setHint(null);
  };

  // Auto-open when interview is active and we have a coding round
  useEffect(() => {
    if (isInterviewActive && problem) {
      setIsOpen(true);
    }
  }, [isInterviewActive, problem]);

  return (
    <div 
      className={`fixed top-0 left-0 h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] z-50 flex ${
        isOpen ? 'w-[55%]' : 'w-0'
      }`}
    >
      <div className="relative h-full flex-1 bg-[#1e1e1e] border-r border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-[#252526] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <Code size={18} className="text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">
              {problem ? 'Coding Challenge' : 'Code Editor'}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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
        {problem && (
          <div className={`border-b border-white/10 bg-[#1a1a1a] transition-all duration-300 ${showProblem ? 'max-h-64' : 'max-h-10'} overflow-hidden`}>
            <button
              onClick={() => setShowProblem(!showProblem)}
              className="w-full px-4 py-2 flex items-center justify-between text-sm text-zinc-300 hover:bg-white/5"
            >
              <span className="font-medium">{problem.title}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  problem.difficulty === Difficulty.EASY ? 'bg-green-500/20 text-green-400' :
                  problem.difficulty === Difficulty.MEDIUM ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {problem.difficulty}
                </span>
                {showProblem ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            
            {showProblem && (
              <div className="px-4 pb-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{problem.description}</p>
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
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={language}
            value={code}
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

        {/* Evaluation Results */}
        {evaluation && (
          <div className={`px-4 py-3 border-t border-white/10 ${evaluation.passed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {evaluation.passed ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <X size={18} className="text-red-400" />
                )}
                <span className={`font-medium ${evaluation.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {evaluation.passed ? 'All Tests Passed!' : 'Some Tests Failed'}
                </span>
              </div>
              <span className="text-sm text-zinc-400">Score: {evaluation.score}/100</span>
            </div>
            <p className="text-xs text-zinc-400">{evaluation.feedback}</p>
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
            
            {problem && (
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
                Hint {problem.hints && hintsUsed < problem.hints.length ? `(${problem.hints.length - hintsUsed} left)` : ''}
              </button>
            )}
          </div>
          
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
              Submit Code
            </button>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="relative h-full flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -left-px flex items-center justify-center w-7 h-14 bg-[#252526] border border-white/10 border-l-0 rounded-r-lg text-zinc-400 hover:text-white hover:bg-[#2d2d2d] transition-all duration-200 shadow-lg group"
          aria-label={isOpen ? 'Close code editor' : 'Open code editor'}
        >
          {isOpen ? (
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Code size={16} />
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default InteractiveCodeEditor;
