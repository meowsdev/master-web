'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { CompleteProfileDto, RequestOtpDto, UserRole, VerifyOtpDto } from '@/types/auth.types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setAuth, logout, setRole } = useAuthStore();

  // Send OTP
  const requestOtpMutation = useMutation({
    mutationFn: (dto: RequestOtpDto) => authService.requestOtp(dto),
    onSuccess: () => {
      toast.success('OTP sent successfully to your mobile number!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    },
  });

  // Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: (dto: VerifyOtpDto) => authService.verifyOtp(dto),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      toast.success('Login successful!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Invalid OTP code');
    },
  });

  // Complete Profile
  const completeProfileMutation = useMutation({
    mutationFn: (dto: CompleteProfileDto) => authService.completeProfile(dto),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      toast.success('Profile completed successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete profile');
    },
  });

  // Switch Profile / Role
  const switchProfileMutation = useMutation({
    mutationFn: (role: UserRole) => authService.switchProfile(role),
    onSuccess: (data, role) => {
      setRole(role);
      toast.success(`Switched to ${role} profile!`);
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to switch profile');
    },
  });

  return {
    user,
    isAuthenticated,
    logout,
    requestOtp: requestOtpMutation.mutateAsync,
    isRequestingOtp: requestOtpMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    completeProfile: completeProfileMutation.mutateAsync,
    isCompletingProfile: completeProfileMutation.isPending,
    switchProfile: switchProfileMutation.mutateAsync,
    isSwitchingProfile: switchProfileMutation.isPending,
  };
};
