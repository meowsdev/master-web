'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminMembersService } from '@/services/admin-members.service';
import { ModerationAction } from '@/types/admin-member.types';

/* Keys carry the admin's user id (AGENTS.md §7), so a signed-out admin's lookups never reach the next one. */
export function useAdminMember(adminId: string, memberId: string) {
  return useQuery({
    queryKey: ['admin-member', adminId, memberId],
    queryFn: () => adminMembersService.getDetails(memberId),
    refetchInterval: 15000,
  });
}

export function useModerateMember(adminId: string, memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, reason }: { action: ModerationAction; reason?: string }) => adminMembersService.moderate(memberId, action, reason),
    onSuccess: (details) => {
      queryClient.setQueryData(['admin-member', adminId, memberId], details);
      // The lists show the status badge, so they refresh too.
      void queryClient.invalidateQueries({ queryKey: ['support-directory', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      toast.success('Done');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not complete the action');
    },
  });
}

/** Moves a technician to another provider (or to none). The backend refuses while they have a job running. */
export function useChangeTechnicianProvider(adminId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ technicianProfileId, providerProfileId }: { technicianProfileId: string; providerProfileId: string | null }) =>
      adminMembersService.changeTechnicianProvider(technicianProfileId, providerProfileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-member', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      // A provider's own details list their technicians.
      toast.success('Provider changed');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not change the provider');
    },
  });
}
