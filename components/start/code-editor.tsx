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
  const [code, setCode] = useState('// Write your code here...');

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };


  return (
    <div 
      className={`fixed top-0 left-0 h-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] z-50 flex ${
        isOpen ? 'w-1/2' : 'w-0'
      }`}
    >
      {/* Main Panel */}
      <div className="relative h-full flex-1 bg-[#1e1e1e] border-r border-white/10 flex flex-col shadow-2xl overflow-hidden">
        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-[#252526] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <Code size={18} className="text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">
              Editor
            </h3>
          </div>
          
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#2d2d2d] text-zinc-300 text-xs px-3 py-1.5 rounded border border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all hover:bg-[#333333]"
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
              <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-zinc-500">
                <span className="animate-pulse text-xs">Initializing...</span>
              </div>
            }
          />
        </div>

        <div className="h-10 px-3 border-t border-white/10 bg-[#252526] flex items-center justify-between shrink-0">
          <button
            onClick={() => setCode('// Write your code here...')}
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
            Reset
          </button>
          
        </div>
      </div>

      <div className="relative h-full flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            absolute -left-px flex items-center justify-center
            w-6 h-12 bg-[#252526] border border-white/10 border-l-0 
            rounded-r-md text-zinc-400 hover:text-white hover:bg-[#2d2d2d]
            transition-all duration-200 shadow-md group
          `}
          aria-label={isOpen ? 'Close code editor' : 'Open code editor'}
        >
          {isOpen ? (
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;