import { apiClient, ApiResponse } from './client';
import {
  VapiContext,
  SaveTranscriptPayload,
  StartInterviewPayload,
  Interview,
  SaveInterviewAnalysisPayload,
  InterviewWithAnalysis,
} from '../types';

export const vapiApi = {
  getContext: (targetId?: string): Promise<ApiResponse<VapiContext>> => {
    const url = targetId ? `/api/vapi/context?targetId=${targetId}` : '/api/vapi/context';
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
  getStats: (): Promise<ApiResponse<{ totalInterviews: number; avgScore: string; hoursPracticed: string }>> => {
    return apiClient.get('/api/interviews/stats');
  },
  saveInterviewAnalysis: (
    payload: SaveInterviewAnalysisPayload
  ): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/api/interviews/analysis', payload);
  },
  analyzeInterview: (id: string): Promise<ApiResponse<InterviewWithAnalysis>> => {
    return apiClient.post<InterviewWithAnalysis>(`/api/interviews/${id}/analyze`, {});
  },
  saveCallMetadata: (payload: { 
    interviewId: string; 
    callId: string; 
    averageExpressions?: Record<string, number>;
  }): Promise<ApiResponse<unknown>> => {
    console.log(payload)
    return apiClient.post('/api/vapi/calls', payload);
  },
};