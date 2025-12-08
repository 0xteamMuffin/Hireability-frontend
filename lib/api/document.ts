import { apiClient, ApiResponse } from './client';
import { Document } from '../types';

export const documentApi = {
  uploadResume: (file: File): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<Document>('/api/documents/resume', formData);
  },

  getResume: (): Promise<ApiResponse<Document>> => {
    return apiClient.get<Document>('/api/documents/resume');
  },
};
