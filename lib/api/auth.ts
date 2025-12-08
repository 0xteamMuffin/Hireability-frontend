import { apiClient, ApiResponse } from './client';
import { AuthResponse, SignupPayload, SigninPayload, User } from '../types';

export const authApi = {
  signup: (payload: SignupPayload): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/api/auth/signup', payload);
  },

  signin: (payload: SigninPayload): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/api/auth/signin', payload);
  },

  getMe: (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get<{ user: User }>('/api/auth/me');
  },
};
