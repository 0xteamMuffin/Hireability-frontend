/**
 * Coding API
 * Handles coding problems and code evaluation
 */

import { apiClient, ApiResponse } from './client';
import {
  CodingProblem,
  CodeEvaluationResult,
  SubmitCodePayload,
  Difficulty,
} from '../types';

interface RunCodePayload {
  code: string;
  language: string;
  stdin?: string;
}

interface RunCodeResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTimeMs?: number;
}

export const codingApi = {
  /**
   * Get all coding problems
   */
  getProblems: async (
    difficulty?: Difficulty,
    category?: string
  ): Promise<ApiResponse<CodingProblem[]>> => {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (category) params.append('category', category);
    
    const query = params.toString();
    return apiClient.get(`/api/coding/problems${query ? `?${query}` : ''}`);
  },

  /**
   * Get a random problem
   */
  getRandomProblem: async (
    difficulty?: Difficulty,
    category?: string
  ): Promise<ApiResponse<CodingProblem>> => {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (category) params.append('category', category);
    
    const query = params.toString();
    return apiClient.get(`/api/coding/problems/random${query ? `?${query}` : ''}`);
  },

  /**
   * Get problem by ID
   */
  getProblemById: async (problemId: string): Promise<ApiResponse<CodingProblem>> => {
    return apiClient.get(`/api/coding/problems/${problemId}`);
  },

  /**
   * Assign a problem to a coding round
   */
  assignProblem: async (
    roundId: string,
    problemId?: string,
    difficulty?: Difficulty
  ): Promise<ApiResponse<CodingProblem>> => {
    return apiClient.post(`/api/coding/round/${roundId}/assign`, {
      problemId,
      difficulty,
    });
  },

  /**
   * Submit code for evaluation
   */
  submitCode: async (payload: SubmitCodePayload): Promise<ApiResponse<CodeEvaluationResult>> => {
    return apiClient.post('/api/coding/submit', payload);
  },

  /**
   * Run code without evaluation (just execution)
   */
  runCode: async (payload: RunCodePayload): Promise<ApiResponse<RunCodeResult>> => {
    return apiClient.post('/api/coding/run', payload);
  },

  /**
   * Get a hint for current code
   */
  getHint: async (
    code: string,
    language: string,
    problemDescription: string
  ): Promise<ApiResponse<{ hint: string }>> => {
    return apiClient.post('/api/coding/hint', {
      code,
      language,
      problemDescription,
    });
  },
};
