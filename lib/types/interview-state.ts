/**
 * Interview State Types for Frontend
 * Mirrors backend types for real-time sync
 */

// Socket Events - must match backend SocketEvent enum
export enum SocketEvent {
  JOIN_INTERVIEW = 'join_interview',
  LEAVE_INTERVIEW = 'leave_interview',
  CODE_UPDATE = 'code_update',
  EXPRESSION_UPDATE = 'expression_update',
  STATE_UPDATE = 'state_update',
  QUESTION_ASKED = 'question_asked',
  ANSWER_EVALUATED = 'answer_evaluated',
  CODING_PROBLEM_ASSIGNED = 'coding_problem_assigned',
  CODE_EXECUTED = 'code_executed',
  INTERVIEW_COMPLETED = 'interview_completed',
}

// Round types
export enum RoundType {
  BEHAVIORAL = 'BEHAVIORAL',
  TECHNICAL = 'TECHNICAL',
  CODING = 'CODING',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  HR = 'HR',
}

// Interview phases
export enum InterviewPhase {
  NOT_STARTED = 'NOT_STARTED',
  INTRODUCTION = 'INTRODUCTION',
  MAIN_QUESTIONS = 'MAIN_QUESTIONS',
  FOLLOW_UP = 'FOLLOW_UP',
  CODING = 'CODING',
  WRAP_UP = 'WRAP_UP',
  COMPLETED = 'COMPLETED',
}

// Difficulty levels
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

// Question categories
export enum QuestionCategory {
  BEHAVIORAL = 'BEHAVIORAL',
  TECHNICAL = 'TECHNICAL',
  SITUATIONAL = 'SITUATIONAL',
  CODING = 'CODING',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  FOLLOW_UP = 'FOLLOW_UP',
  WARM_UP = 'WARM_UP',
  CLOSING = 'CLOSING',
}

// Current question state
export interface CurrentQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  questionNumber: number;
}

// Answer evaluation
export interface AnswerEvaluation {
  questionId: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  followUpQuestion?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  overallScore: number;
  questionsAnswered: number;
  averageScore: number;
  strongAreas: string[];
  weakAreas: string[];
  topicMastery: Record<string, number>;
}

// Coding problem received from backend
export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  constraints?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode?: Record<string, string>;
  hints?: string[];
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;
}

// Coding state
export interface CodingState {
  problemId: string | null;
  currentCode: string;
  language: string;
  attempts: number;
  hintsUsed: number;
  lastResult?: CodeExecutionResult;
}

// Code execution result
export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  testResults?: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    executionTimeMs: number;
    error?: string;
  }>;
  passedTests?: number;
  totalTests?: number;
}

// Interview state snapshot - what we receive from backend
export interface InterviewStateSnapshot {
  interviewId: string;
  userId: string;
  roundType: RoundType;
  phase: InterviewPhase;
  questionsAsked: number;
  currentDifficulty: Difficulty;
  performance: PerformanceMetrics;
  codingState?: CodingState | null;
  targetRole?: string | null;
  targetCompany?: string | null;
  startedAt: string;
  lastActivityAt: string;
}

// Transcript entry (enhanced)
export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'question' | 'answer' | 'feedback' | 'hint' | 'general';
  metadata?: {
    questionId?: string;
    category?: string;
    difficulty?: string;
    score?: number;
  };
}

// Round display info - keep consistent with existing types
export interface RoundDisplayInfo {
  type: RoundType;
  title: string;
  description: string;
  icon: string;
  estimatedDuration: number;
}

export const ROUND_DISPLAY_INFO: Record<RoundType, Omit<RoundDisplayInfo, 'type'>> = {
  [RoundType.BEHAVIORAL]: {
    title: 'Behavioral Round',
    description: 'Questions about your experience, soft skills, and culture fit',
    icon: 'users',
    estimatedDuration: 15,
  },
  [RoundType.TECHNICAL]: {
    title: 'Technical Round',
    description: 'Deep dive into your technical knowledge and problem-solving',
    icon: 'cpu',
    estimatedDuration: 25,
  },
  [RoundType.CODING]: {
    title: 'Live Coding',
    description: 'Solve a coding problem while explaining your thought process',
    icon: 'code',
    estimatedDuration: 30,
  },
  [RoundType.SYSTEM_DESIGN]: {
    title: 'System Design',
    description: 'Design a scalable system architecture',
    icon: 'network',
    estimatedDuration: 35,
  },
  [RoundType.HR]: {
    title: 'HR Round',
    description: 'Final discussion about role expectations and company fit',
    icon: 'briefcase',
    estimatedDuration: 10,
  },
};
