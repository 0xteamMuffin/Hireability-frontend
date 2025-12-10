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
  getContext: (): Promise<ApiResponse<VapiContext>> => {
    return apiClient.get<VapiContext>('/api/vapi/context');
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

