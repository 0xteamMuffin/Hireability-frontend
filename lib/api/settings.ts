import { apiClient, ApiResponse } from './client';

export interface UserSettings {
  id: string;
  userId: string;
  notifications: boolean;
  darkMode: boolean;
  language: string;
  multiRoundEnabled: boolean;
  prerequisitesEnabled: boolean;
  defaultRounds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings | null;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSettingsInput {
  notifications?: boolean;
  darkMode?: boolean;
  language?: string;
  multiRoundEnabled?: boolean;
  prerequisitesEnabled?: boolean;
  defaultRounds?: string[];
}

export const settingsApi = {
  getUserDetails: async (): Promise<ApiResponse<UserDetails>> => {
    return apiClient.get<UserDetails>('/api/settings/user');
  },

  updateUserDetails: async (data: UpdateUserInput): Promise<ApiResponse<UserDetails>> => {
    return apiClient.put<UserDetails>('/api/settings/user', data);
  },

  updatePassword: async (data: UpdatePasswordInput): Promise<ApiResponse<void>> => {
    return apiClient.put<void>('/api/settings/password', data);
  },

  getPreferences: async (): Promise<ApiResponse<UserSettings>> => {
    return apiClient.get<UserSettings>('/api/settings/preferences');
  },

  updatePreferences: async (data: UpdateSettingsInput): Promise<ApiResponse<UserSettings>> => {
    return apiClient.put<UserSettings>('/api/settings/preferences', data);
  },

  deleteAccount: async (): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>('/api/settings/account');
  },
};
