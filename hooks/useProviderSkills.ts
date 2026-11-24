'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serviceAssigneeService } from '@/services/service-assignee.service';
import { servicesService } from '@/services/services.service';
import { Service } from '@/types/service.types';

/* Query keys carry the user id (AGENTS.md §7), so one account never reads another's skills. */
export function useProviderSkills(userId: string) {
  // Its own key: 'super-app-services' holds the chat list's main services, not these sub-services. Sharing it
  // fed main-service ids to the picker, and the backend drops those on save. Always fresh, so a sub-service the
  // admin just added can be ticked.
  const services = useQuery<Service[]>({ queryKey: ['provider-skill-services'], queryFn: () => servicesService.getServices(), staleTime: 0 });
  const mySkills = useQuery({ queryKey: ['provider-my-skills', userId], queryFn: serviceAssigneeService.getMySkills });
  return { services: services.data ?? [], mySkills: mySkills.data, isLoading: services.isLoading || mySkills.isLoading };
}

export function useSaveProviderSkills(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceIds: string[]) => serviceAssigneeService.syncMySkills(serviceIds),
    onSuccess: (saved, sentIds) => {
      queryClient.setQueryData(['provider-my-skills', userId], saved);
      // The order list depends on the skills: only these services send this provider new orders.
      void queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });
      // The backend keeps only live sub-services; say so instead of claiming everything was saved.
      const skipped = new Set(sentIds).size - saved.length;
      if (skipped > 0) {
        void queryClient.invalidateQueries({ queryKey: ['provider-skill-services'] });
        toast.warning(`Saved ${saved.length} service(s). ${skipped} could not be saved because they were removed or turned off. Please check your list again.`);
        return;
      }
      toast.success(`Saved: you will get new orders for ${saved.length} service(s)`);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not save your services');
    },
  });
}
