'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { providerAreasService, ProviderServiceArea } from '@/services/provider-areas.service';

/* Query keys carry the user id (AGENTS.md §7) so one account never reads another's areas. */
export function useProviderAreas(userId: string) {
  return useQuery({
    queryKey: ['provider-areas', userId],
    queryFn: providerAreasService.getMyAreas,
  });
}

export function useSaveProviderAreas(userId: string, onSaved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (areas: ProviderServiceArea[]) => providerAreasService.saveMyAreas(areas),
    onSuccess: (saved) => {
      queryClient.setQueryData(['provider-areas', userId], saved);
      toast.success('Your areas are saved');
      onSaved();
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not save your areas');
    },
  });
}
