import { apiClient, ApiResponse } from './client';
import { VapiContext } from '../types';

export const vapiApi = {
  getContext: (): Promise<ApiResponse<VapiContext>> => {
    return apiClient.get<VapiContext>('/api/vapi/context');
  },
};

