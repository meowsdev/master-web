import { apiClient } from '@/lib/axios';
import {
  AuthResponse,
  CompleteProfileDto,
  RequestOtpDto,
  TechnicianLoginDto,
  User,
  UserRole,
  VerifyOtpDto,
} from '@/types/auth.types';

export const authService = {
  requestOtp: async (dto: RequestOtpDto) => {
    const response = await apiClient.post<{ message: string; code?: string }>(
      '/auth/request-otp',
      dto
    );
    return response.data;
  },

  verifyOtp: async (dto: VerifyOtpDto) => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', dto);
    return response.data;
  },

  technicianLogin: async (dto: TechnicianLoginDto) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/technician-login',
      dto
    );
    return response.data;
  },

  completeProfile: async (dto: CompleteProfileDto) => {
    const response = await apiClient.patch<User>('/auth/complete-profile', dto);
    return response.data;
  },

  switchProfile: async (role: UserRole) => {
    const response = await apiClient.post<User>('/auth/switch-profile', {
      role,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  logout: async (refreshToken?: string) => {
    const response = await apiClient.post<{ message: string }>('/auth/logout', {
      refreshToken,
    });
    return response.data;
  },
};
