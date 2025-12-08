import { apiClient, ApiResponse } from './client';

export interface TargetCompany {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  companyEmail: string | null;
  websiteLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTargetInput {
  companyName: string;
  role: string;
  companyEmail?: string;
  websiteLink?: string;
}

export interface UpdateTargetInput {
  companyName?: string;
  role?: string;
  companyEmail?: string;
  websiteLink?: string;
}

export const targetApi = {
  getAll: async (): Promise<ApiResponse<TargetCompany[]>> => {
    return apiClient.get<TargetCompany[]>('/api/targets');
  },

  getById: async (id: string): Promise<ApiResponse<TargetCompany>> => {
    return apiClient.get<TargetCompany>(`/api/targets/${id}`);
  },

  create: async (data: CreateTargetInput): Promise<ApiResponse<TargetCompany>> => {
    return apiClient.post<TargetCompany>('/api/targets', data);
  },

  update: async (id: string, data: UpdateTargetInput): Promise<ApiResponse<TargetCompany>> => {
    return apiClient.put<TargetCompany>(`/api/targets/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/api/targets/${id}`);
  },
};
