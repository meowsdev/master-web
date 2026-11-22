'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AddTechnicianRequest, providerTeamService } from '@/services/provider-team.service';

/* Keys carry the signed-in user's id (AGENTS.md §7). */
export function useProviderTeam(userId: string) {
  return useQuery({
    queryKey: ['provider-team', userId],
    queryFn: providerTeamService.list,
  });
}

/** Adds a technician to the provider's team; every list of the provider's technicians is read again. */
export function useAddTeamTechnician(userId: string, onAdded?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddTechnicianRequest) => providerTeamService.add(body),
    onSuccess: (technician) => {
      void queryClient.invalidateQueries({ queryKey: ['provider-team', userId] });
      // Every order's Assign Worker list shows the new technician too.
      void queryClient.invalidateQueries({ queryKey: ['order-technicians', userId] });
      toast.success(`${technician.name} আপনার টিমে যোগ হয়েছে।`);
      onAdded?.();
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'টেকনিশিয়ান যোগ করা যায়নি।');
    },
  });
}
