/**
 * Session API
 * Handles multi-round interview sessions
 */

import { apiClient, ApiResponse } from './client';
import {
  InterviewSession,
  InterviewRound,
  CreateSessionPayload,
  StartRoundPayload,
  CompleteRoundPayload,
} from '../types';

export const sessionApi = {
  /**
   * Create a new interview session
   */
  createSession: async (payload: CreateSessionPayload): Promise<ApiResponse<InterviewSession>> => {
    return apiClient.post('/api/sessions', payload);
  },

  /**
   * Get all sessions for current user
   */
  getSessions: async (): Promise<ApiResponse<InterviewSession[]>> => {
    return apiClient.get('/api/sessions');
  },

  /**
   * Get session by ID
   */
  getSession: async (sessionId: string): Promise<ApiResponse<InterviewSession>> => {
    return apiClient.get(`/api/sessions/${sessionId}`);
  },

  /**
   * Get active (in-progress) session
   */
  getActiveSession: async (): Promise<ApiResponse<InterviewSession | null>> => {
    return apiClient.get('/api/sessions/active');
  },

  /**
   * Check if multi-round mode is enabled for user
   */
  isMultiRoundEnabled: async (): Promise<ApiResponse<{ multiRoundEnabled: boolean }>> => {
    return apiClient.get('/api/sessions/multi-round-enabled');
  },

  /**
   * Start a specific round
   */
  startRound: async (payload: StartRoundPayload): Promise<ApiResponse<InterviewRound>> => {
    return apiClient.post('/api/sessions/round/start', payload);
  },

  /**
   * Complete a round and unlock next
   */
  completeRound: async (payload: CompleteRoundPayload): Promise<ApiResponse<InterviewSession>> => {
    return apiClient.post('/api/sessions/round/complete', payload);
  },

  /**
   * Skip a round (if allowed)
   */
  skipRound: async (sessionId: string, roundId: string): Promise<ApiResponse<InterviewSession>> => {
    return apiClient.post(`/api/sessions/${sessionId}/round/${roundId}/skip`, {});
  },

  /**
   * Abandon a session
   */
  abandonSession: async (sessionId: string): Promise<ApiResponse<InterviewSession>> => {
    return apiClient.post(`/api/sessions/${sessionId}/abandon`, {});
  },
};
