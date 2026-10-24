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

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+880')) return cleaned;
  if (cleaned.startsWith('880')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+88${cleaned}`;
  return `+880${cleaned}`;
}

export const authService = {
  requestOtp: async (dto: RequestOtpDto) => {
    const formattedPhone = formatPhoneNumber(dto.phoneNumber);
    const response = await apiClient.post<{ message: string; code?: string }>(
      '/auth/request-otp',
      { phoneNumber: formattedPhone }
    );
    return response.data;
  },

  verifyOtp: async (dto: VerifyOtpDto) => {
    const formattedPhone = formatPhoneNumber(dto.phoneNumber);
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', {
      phoneNumber: formattedPhone,
      code: dto.code,
    });
    return response.data;
  },

  technicianLogin: async (dto: TechnicianLoginDto) => {
    const formattedPhone = formatPhoneNumber(dto.phoneNumber);
    const response = await apiClient.post<AuthResponse>(
      '/auth/technician-login',
      { phoneNumber: formattedPhone, password: dto.password }
    );
    return response.data;
  },

  completeProfile: async (dto: CompleteProfileDto) => {
    const response = await apiClient.patch<User>('/auth/complete-profile', dto);
    return response.data;
  },

  switchProfile: async (role: UserRole) => {
    const response = await apiClient.post<AuthResponse & User>('/auth/switch-profile', {
      role,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  rechargeProviderWallet: async (amount: number) => {
    const response = await apiClient.post<User>('/auth/provider/recharge-wallet', {
      amount,
    });
    return response.data;
  },

  logout: async (refreshToken?: string) => {
    const response = await apiClient.post<{ message: string }>('/auth/logout', {
      refreshToken,
    });
    return response.data;
  },
};
