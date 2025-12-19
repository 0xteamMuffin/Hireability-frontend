import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

const CodeEditor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  return (
    <div
      className={`fixed top-0 left-0 z-50 flex h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
        isOpen ? 'w-1/2' : 'w-0'
      }`}
    >
      {/* Main Panel */}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden border-r border-white/10 bg-[#1e1e1e] shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#252526] px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-1.5">
              <Code size={18} className="text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">Editor</h3>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border border-white/5 bg-[#2d2d2d] px-3 py-1.5 text-xs text-zinc-300 transition-all hover:bg-[#333333] focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Editor Area */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
              wordWrap: 'on',
            }}
            loading={
              <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-zinc-500">
                <span className="animate-pulse text-xs">Initializing...</span>
              </div>
            }
          />
        </div>

        <div className="flex h-10 shrink-0 items-center justify-between border-t border-white/10 bg-[#252526] px-3">
          <button
            onClick={() => setCode('')}
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:text-red-400"
          >
            <Trash2 size={13} />
            Reset
          </button>
        </div>
      </div>

      <div className="relative flex h-full items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group absolute -left-px flex h-12 w-6 items-center justify-center rounded-r-md border border-l-0 border-white/10 bg-[#252526] text-zinc-400 shadow-md transition-all duration-200 hover:bg-[#2d2d2d] hover:text-white`}
          aria-label={isOpen ? 'Close code editor' : 'Open code editor'}
        >
          {isOpen ? (
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
