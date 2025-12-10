export interface User {
  id: string;
  email: string;
  username: string;
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
  type: 'RESUME' | 'JOB_DESCRIPTION' | 'OTHER';
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  parsedData: Record<string, unknown> | null;
  confidence: number | null;
  processedAt: string | null;
  createdAt: string;
}

export interface VapiContext {
  prompt: string;
  profile: {
    targetRole: string | null;
    targetCompany: string | null;
    level: string | null;
  } | null;
  resume: {
    fileName: string;
    status: string;
    parsedData: Record<string, unknown> | null;
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

export interface Interview {
  id: string;
  userId: string;
  assistantId: string | null;
  callId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  contextPrompt: string | null;
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
