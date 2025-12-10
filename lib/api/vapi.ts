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
  saveInterviewAnalysis: (
    payload: SaveInterviewAnalysisPayload
  ): Promise<ApiResponse<unknown>> => {
    return apiClient.post('/api/interviews/analysis', payload);
  },
};

