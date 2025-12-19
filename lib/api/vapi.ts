import { apiClient, ApiResponse } from './client';
import {
  VapiContext,
  SaveTranscriptPayload,
  StartInterviewPayload,
  Interview,
  SaveInterviewAnalysisPayload,
  InterviewWithAnalysis,
} from '../types';

import type { CodeExecutionResult } from '../types/interview-state';

export const vapiApi = {
  getContext: (targetId?: string, roundType?: string): Promise<ApiResponse<VapiContext>> => {
    const params = new URLSearchParams();
    if (targetId) params.append('targetId', targetId);
    if (roundType) params.append('roundType', roundType);
    const queryString = params.toString();
    const url = queryString ? `/api/vapi/context?${queryString}` : '/api/vapi/context';
    return apiClient.get<VapiContext>(url);
  },
  saveTranscript: (payload: SaveTranscriptPayload): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/api/transcripts', payload);
  },
  startInterview: (payload: StartInterviewPayload): Promise<ApiResponse<Interview>> => {
    return apiClient.post('/api/interviews', payload);
  },
  getInterviews: (): Promise<ApiResponse<InterviewWithAnalysis[]>> => {
    return apiClient.get<InterviewWithAnalysis[]>('/api/interviews');
  },
  getInterviewById: (id: string): Promise<ApiResponse<InterviewWithAnalysis>> => {
    return apiClient.get<InterviewWithAnalysis>(`/api/interviews/${id}`);
  },
  getStats: (): Promise<
    ApiResponse<{ totalInterviews: number; avgScore: string; hoursPracticed: string }>
  > => {
    return apiClient.get('/api/interviews/stats');
  },
  saveInterviewAnalysis: (payload: SaveInterviewAnalysisPayload): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/api/interviews/analysis', payload);
  },
  analyzeInterview: (id: string): Promise<ApiResponse<InterviewWithAnalysis>> => {
    return apiClient.post<InterviewWithAnalysis>(`/api/interviews/${id}/analyze`, {});
  },
  deleteInterview: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/api/interviews/${id}`);
  },
  saveCallMetadata: (payload: {
    interviewId: string;
    callId: string;
    averageExpressions?: Record<string, number>;
  }): Promise<ApiResponse<unknown>> => {
    console.log(payload);
    return apiClient.post('/api/vapi/calls', payload);
  },

  initializeInterviewState: (payload: {
    userId: string;
    interviewId: string;
    sessionId?: string;
    roundType: string;
    targetId?: string;
  }): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/api/vapi/interactive/initializeInterview', payload);
  },

  executeCoding: (payload: {
    interviewId: string;
    code?: string;
    language?: string;
  }): Promise<
    ApiResponse<{ result: CodeExecutionResult; feedback: string; allPassed: boolean }>
  > => {
    return apiClient.post('/api/vapi/interactive/executeCode', payload);
  },

  getCodingHint: (payload: {
    interviewId: string;
  }): Promise<ApiResponse<{ hint: string; hintsRemaining: number }>> => {
    return apiClient.post('/api/vapi/interactive/getCodingHint', payload);
  },
};
