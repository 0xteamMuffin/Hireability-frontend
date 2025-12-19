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
  isConnected: boolean;
  error: string | null;

  interviewState: InterviewStateSnapshot | null;

  currentQuestion: CurrentQuestion | null;

  lastEvaluation: AnswerEvaluation | null;

  codingProblem: CodingProblem | null;

  codeExecutionResult: CodeExecutionResult | null;

  currentCode: string;
  codeLanguage: string;

  transcript: TranscriptEntry[];

  isCodeEditorOpen: boolean;
  showEvaluationFeedback: boolean;

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

        const isCodingPhase =
          state?.phase === InterviewPhase.CODING_SETUP ||
          state?.phase === InterviewPhase.CODING_ACTIVE ||
          state?.phase === InterviewPhase.CODING_REVIEW ||
          state?.roundType === RoundType.CODING;

        if (isCodingPhase) {
          const { codingProblem } = get();
          if (codingProblem) {
            set({ isCodeEditorOpen: true });
          }
        }
      },

      setCurrentQuestion: (question) =>
        set({
          currentQuestion: question,

          lastEvaluation: null,
          showEvaluationFeedback: false,
        }),

      setLastEvaluation: (evaluation) =>
        set({
          lastEvaluation: evaluation,
          showEvaluationFeedback: true,
        }),

      setCodingProblem: (problem) => {
        console.log('[InterviewStore] setCodingProblem called with:', problem);

        if (!problem) {
          set({
            codingProblem: null,
            codeExecutionResult: null,
          });
          return;
        }

        let starterCode = '';
        if (typeof problem.starterCode === 'string' && problem.starterCode) {
          starterCode = problem.starterCode;
        } else if (typeof problem.currentCode === 'string' && problem.currentCode) {
          starterCode = problem.currentCode;
        }

        console.log(
          '[InterviewStore] Opening code editor with starter code:',
          starterCode.substring(0, 50),
        );

        set({
          codingProblem: problem,
          codeExecutionResult: null,
          currentCode: starterCode,
          isCodeEditorOpen: true,
          codeLanguage: problem.language || 'javascript',
        });

        console.log('[InterviewStore] Code editor should now be open');
      },

      setCodeExecutionResult: (result) => set({ codeExecutionResult: result }),

      setCurrentCode: (code) => set({ currentCode: code }),

      setCodeLanguage: (language) => {
        set({ codeLanguage: language });
      },

      addToTranscript: (entry) =>
        set((state) => ({
          transcript: [...state.transcript, entry],
        })),

      clearTranscript: () => set({ transcript: [] }),

      setCodeEditorOpen: (open) => set({ isCodeEditorOpen: open }),

      setShowEvaluationFeedback: (show) => set({ showEvaluationFeedback: show }),

      reset: () => set(initialState),
    })),
    { name: 'interview-store' },
  ),
);

export const selectIsInterviewActive = (state: InterviewStore) =>
  state.interviewState?.phase !== InterviewPhase.NOT_STARTED &&
  state.interviewState?.phase !== InterviewPhase.COMPLETED;

export const selectIsCodingPhase = (state: InterviewStore) =>
  state.interviewState?.phase === InterviewPhase.CODING_SETUP ||
  state.interviewState?.phase === InterviewPhase.CODING_ACTIVE ||
  state.interviewState?.phase === InterviewPhase.CODING_REVIEW ||
  state.interviewState?.roundType === RoundType.CODING;

export const selectPerformance = (state: InterviewStore) =>
  state.interviewState?.performance || null;

export const selectCurrentDifficulty = (state: InterviewStore) =>
  state.interviewState?.currentDifficulty || Difficulty.MEDIUM;
