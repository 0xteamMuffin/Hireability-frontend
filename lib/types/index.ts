export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface Profile {
  id: string;
  userId: string;
  targetRole: string | null;
  targetCompany: string | null;
  level: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePayload {
  targetRole: string;
  targetCompany: string;
  level: string;
}

export interface Document {
  id: string;
  type: "RESUME" | "JOB_DESCRIPTION" | "OTHER";
  fileName: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  parsedData: Record<string, unknown> | null;
  confidence: number | null;
  processedAt: string | null;
  createdAt: string;
  analysis?: any;
}

export interface VapiContext {
  systemPrompt: string;
  firstMessage: string;
  profile: {
    targetRole: string | null;
    targetCompany: string | null;
    level: string | null;
  } | null;
  resume: {
    fileName: string;
    status: string;
    parsedData: any;
    confidence: number | null;
  } | null;
}

export interface SaveTranscriptPayload {
  interviewId: string;
  assistantId?: string | null;
  callId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  transcript: Array<{
    role: string;
    text: string;
    timestamp: string;
    isFinal?: boolean;
  }>;
}

export interface SaveCallMetadataPayload {
  interviewId: string;
  callId: string;
}

// Multi-Round Interview System Enums (moved before Interview interface)
export enum RoundType {
  BEHAVIORAL = 'BEHAVIORAL',
  TECHNICAL = 'TECHNICAL',
  CODING = 'CODING',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  HR = 'HR',
}

export enum InterviewStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface Interview {
  id: string;
  userId: string;
  assistantId: string | null;
  callId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  contextPrompt: string | null;
  roundType: RoundType | null;
  roundOrder: number;
  sessionId: string | null;
  status: InterviewStatus;
  createdAt: string;
}

export interface StartInterviewPayload {
  assistantId?: string | null;
  callId?: string | null;
  startedAt?: string | null;
  contextPrompt?: string | null;
}

export interface AnalysisDimension {
  score?: number | null;
  notes?: string | null;
  source?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  summary?: string;
}

export interface SaveInterviewAnalysisPayload {
  interviewId: string;
  technical?: AnalysisDimension;
  problemSolving?: AnalysisDimension;
  communication?: AnalysisDimension;
  roleKnowledge?: AnalysisDimension;
  experience?: AnalysisDimension;
  professional?: AnalysisDimension;
  overall?: AnalysisDimension;
  modelVersion?: string | null;
}

export interface InterviewWithAnalysis extends Interview {
  analysis?: {
    id: string;
    interviewId: string;
    technical?: AnalysisDimension | null;
    problemSolving?: AnalysisDimension | null;
    communication?: AnalysisDimension | null;
    roleKnowledge?: AnalysisDimension | null;
    experience?: AnalysisDimension | null;
    professional?: AnalysisDimension | null;
    overall?: AnalysisDimension | null;
    modelVersion?: string | null;
    createdAt: string;
  } | null;
  transcripts?: Array<{
    id: string;
    interviewId: string;
    startedAt: string | null;
    endedAt: string | null;
    durationSeconds: number | null;
    transcript: Array<{
      role: string;
      text: string;
      timestamp?: string;
      isFinal?: boolean;
    }> | null;
    createdAt: string;
  }>;
}

// Multi-Round Interview System Types

export interface InterviewRound {
  id: string;
  sessionId: string;
  interviewId: string | null;
  roundType: RoundType;
  order: number;
  status: InterviewStatus;
  isLocked: boolean;
  problemId: string | null;
  codeSubmission: string | null;
  codeLanguage: string | null;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  targetId: string | null;
  status: SessionStatus;
  currentRound: number;
  totalRounds: number;
  completedAt: string | null;
  createdAt: string;
  rounds: InterviewRound[];
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  starterCode: Record<string, string> | null;
  hints: string[];
}

export interface CodeEvaluationResult {
  passed: boolean;
  testResults: Array<{
    name: string;
    passed: boolean;
    expected: string;
    actual: string;
    error?: string;
  }>;
  feedback: string;
  score: number;
}

export interface CreateSessionPayload {
  targetId?: string;
  rounds?: RoundType[];
}

export interface StartRoundPayload {
  sessionId: string;
  roundId: string;
}

export interface CompleteRoundPayload {
  sessionId: string;
  roundId: string;
  interviewId?: string;
}

export interface SubmitCodePayload {
  roundId: string;
  code: string;
  language: string;
}

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
    description: 'Deep dive into your technical knowledge and problem-solving approach',
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
