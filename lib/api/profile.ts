import { apiClient, ApiResponse } from './client';
import { Profile, ProfilePayload } from '../types';

export const profileApi = {
  get: (): Promise<ApiResponse<Profile>> => {
    return apiClient.get<Profile>('/api/profile');
  },

  upsert: (payload: ProfilePayload): Promise<ApiResponse<Profile>> => {
    return apiClient.post<Profile>('/api/profile', payload);
  },
};
