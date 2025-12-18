/**
 * Interview State Store (Zustand)
 * Global state management for real-time interview data
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import {
  InterviewStateSnapshot,
  CurrentQuestion,
  AnswerEvaluation,
  CodingProblem,
  CodeExecutionResult,
  TranscriptEntry,
  InterviewPhase,
  RoundType,
  Difficulty,
} from '../types/interview-state';

interface InterviewStore {
  // Connection state
  isConnected: boolean;
  error: string | null;

  // Interview state from backend
  interviewState: InterviewStateSnapshot | null;
  
  // Current question being asked
  currentQuestion: CurrentQuestion | null;
  
  // Last evaluation received
  lastEvaluation: AnswerEvaluation | null;
  
  // Coding problem (for coding rounds)
  codingProblem: CodingProblem | null;
  
  // Latest code execution result
  codeExecutionResult: CodeExecutionResult | null;
  
  // Local code state (synced with server)
  currentCode: string;
  codeLanguage: string;
  
  // Enhanced transcript with question/answer metadata
  transcript: TranscriptEntry[];
  
  // UI state
  isCodeEditorOpen: boolean;
  showEvaluationFeedback: boolean;

  // Actions
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setInterviewState: (state: InterviewStateSnapshot | null) => void;
  setCurrentQuestion: (question: CurrentQuestion | null) => void;
  setLastEvaluation: (evaluation: AnswerEvaluation | null) => void;
  setCodingProblem: (problem: CodingProblem | null) => void;
  setCodeExecutionResult: (result: CodeExecutionResult | null) => void;
  setCurrentCode: (code: string) => void;
  setCodeLanguage: (language: string) => void;
  addToTranscript: (entry: TranscriptEntry) => void;
  clearTranscript: () => void;
  setCodeEditorOpen: (open: boolean) => void;
  setShowEvaluationFeedback: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  isConnected: false,
  error: null,
  interviewState: null,
  currentQuestion: null,
  lastEvaluation: null,
  codingProblem: null,
  codeExecutionResult: null,
  currentCode: '',
  codeLanguage: 'javascript',
  transcript: [],
  isCodeEditorOpen: false,
  showEvaluationFeedback: false,
};

export const useInterviewStore = create<InterviewStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setConnected: (connected) => set({ isConnected: connected }),
      
      setError: (error) => set({ error }),
      
      setInterviewState: (state) => {
        set({ interviewState: state });
        
        // Auto-open code editor for coding rounds/phases
        if (state?.phase === InterviewPhase.CODING || state?.roundType === RoundType.CODING) {
          const { codingProblem } = get();
          if (codingProblem) {
            set({ isCodeEditorOpen: true });
          }
        }
      },
      
      setCurrentQuestion: (question) => set({ 
        currentQuestion: question,
        // Clear last evaluation when new question arrives
        lastEvaluation: null,
        showEvaluationFeedback: false,
      }),
      
      setLastEvaluation: (evaluation) => set({ 
        lastEvaluation: evaluation,
        showEvaluationFeedback: true,
      }),
      
      setCodingProblem: (problem) => {
        set({ 
          codingProblem: problem,
          // Reset code state
          codeExecutionResult: null,
        });
        
        // Set starter code if available
        if (problem?.starterCode) {
          const { codeLanguage } = get();
          const starterCode = problem.starterCode[codeLanguage] || 
                             problem.starterCode['javascript'] || 
                             '// Write your solution here\n';
          set({ 
            currentCode: starterCode,
            isCodeEditorOpen: true,
          });
        }
      },
      
      setCodeExecutionResult: (result) => set({ codeExecutionResult: result }),
      
      setCurrentCode: (code) => set({ currentCode: code }),
      
      setCodeLanguage: (language) => {
        set({ codeLanguage: language });
        
        // Update starter code if problem has it
        const { codingProblem } = get();
        if (codingProblem?.starterCode?.[language]) {
          set({ currentCode: codingProblem.starterCode[language] });
        }
      },
      
      addToTranscript: (entry) => set((state) => ({
        transcript: [...state.transcript, entry],
      })),
      
      clearTranscript: () => set({ transcript: [] }),
      
      setCodeEditorOpen: (open) => set({ isCodeEditorOpen: open }),
      
      setShowEvaluationFeedback: (show) => set({ showEvaluationFeedback: show }),
      
      reset: () => set(initialState),
    })),
    { name: 'interview-store' }
  )
);

// Selectors for common data access patterns
export const selectIsInterviewActive = (state: InterviewStore) => 
  state.interviewState?.phase !== InterviewPhase.NOT_STARTED && 
  state.interviewState?.phase !== InterviewPhase.COMPLETED;

export const selectIsCodingPhase = (state: InterviewStore) =>
  state.interviewState?.phase === InterviewPhase.CODING ||
  state.interviewState?.roundType === RoundType.CODING;

export const selectPerformance = (state: InterviewStore) =>
  state.interviewState?.performance || null;

export const selectCurrentDifficulty = (state: InterviewStore) =>
  state.interviewState?.currentDifficulty || Difficulty.MEDIUM;
