/**
 * Interview State Types for Frontend
 * Mirrors backend types for real-time sync
 */

// Socket Events - must match backend SocketEvent enum exactly
export enum SocketEvent {
  // Server -> Client
  STATE_UPDATE = 'interview:state_update',
  QUESTION_ASKED = 'interview:question_asked',
  ANSWER_EVALUATED = 'interview:answer_evaluated',
  CODING_PROBLEM_ASSIGNED = 'interview:coding_problem_assigned',
  CODE_EXECUTED = 'interview:code_executed',
  HINT_PROVIDED = 'interview:hint_provided',
  PHASE_CHANGED = 'interview:phase_changed',
  INTERVIEW_COMPLETED = 'interview:completed',
  
  // Client -> Server
  JOIN_INTERVIEW = 'interview:join',
  LEAVE_INTERVIEW = 'interview:leave',
  CODE_UPDATE = 'interview:code_update',
  EXPRESSION_UPDATE = 'interview:expression_update',
  REQUEST_STATE = 'interview:request_state',
}

// Round types
export enum RoundType {
  BEHAVIORAL = 'BEHAVIORAL',
  TECHNICAL = 'TECHNICAL',
  CODING = 'CODING',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  HR = 'HR',
}

// Interview phases - must match backend exactly (lowercase)
export enum InterviewPhase {
  NOT_STARTED = 'not_started',
  INTRODUCTION = 'introduction',
  MAIN_QUESTIONS = 'main_questions',
  DEEP_DIVE = 'deep_dive',
  CODING_SETUP = 'coding_setup',
  CODING_ACTIVE = 'coding_active',
  CODING_REVIEW = 'coding_review',
  WRAP_UP = 'wrap_up',
  COMPLETED = 'completed',
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

// Coding problem received from backend (matches backend CodingState)
export interface CodingProblem {
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  difficulty: Difficulty;
  language: string;
  currentCode: string;
  starterCode: string; // Single starter code for selected language
  hintsUsed: number;
  hintsAvailable: string[];
  testCasesPassed: number;
  totalTestCases: number;
  startedAt?: string;
  timeSpentSeconds?: number;
  // Optional fields that may come from the raw problem
  category?: string;
  constraints?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
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
