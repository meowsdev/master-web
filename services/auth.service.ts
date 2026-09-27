import { apiClient } from '@/lib/axios';
import { AuthResponse, CompleteProfileDto, RequestOtpDto, UserRole, VerifyOtpDto } from '@/types/auth.types';

export const authService = {
  requestOtp: async (dto: RequestOtpDto) => {
    const response = await apiClient.post<{ message: string }>('/auth/request-otp', dto);
    return response.data;
  },

  verifyOtp: async (dto: VerifyOtpDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', dto);
    return response.data;
  },

  completeProfile: async (dto: CompleteProfileDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/complete-profile', dto);
    return response.data;
  },

  switchProfile: async (role: UserRole) => {
    const response = await apiClient.post<AuthResponse>('/auth/switch-profile', { role });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<AuthResponse['user']>('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },
};
