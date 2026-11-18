'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serviceAssigneeService } from '@/services/service-assignee.service';
import { servicesService } from '@/services/services.service';
import { Service } from '@/types/service.types';

/* Query keys carry the user id (AGENTS.md §7), so one account never reads another's skills. */
export function useProviderSkills(userId: string) {
  const services = useQuery<Service[]>({ queryKey: ['super-app-services'], queryFn: () => servicesService.getServices() });
  const mySkills = useQuery({ queryKey: ['provider-my-skills', userId], queryFn: serviceAssigneeService.getMySkills });
  return { services: services.data ?? [], mySkills: mySkills.data, isLoading: services.isLoading || mySkills.isLoading };
}

export function useSaveProviderSkills(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceIds: string[]) => serviceAssigneeService.syncMySkills(serviceIds),
    onSuccess: (saved) => {
      queryClient.setQueryData(['provider-my-skills', userId], saved);
      // The order list depends on the skills: only these services send this provider new orders.
      void queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });
      toast.success(`Saved: you will get new orders for ${saved.length} service(s)`);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not save your services');
    },
  });
}
