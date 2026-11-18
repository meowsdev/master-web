'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminOrdersService, AssignmentMode } from '@/services/admin-orders.service';

/* Keys carry the admin's user id (AGENTS.md §7). */
export function useAssignableProviders(adminId: string, orderId: string) {
  return useQuery({
    queryKey: ['admin-assignable', adminId, orderId],
    queryFn: () => adminOrdersService.getAssignableProviders(orderId),
    // The order may be taken by a provider while the admin looks; a fresh list tells them in time.
    refetchInterval: 10000,
  });
}

export function useAssignOrder(adminId: string, orderId: string, onSent: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ providerId, mode }: { providerId: string; mode: AssignmentMode }) => adminOrdersService.assign(orderId, providerId, mode),
    onSuccess: (_result, { mode }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-orders', adminId] });
      toast.success(mode === 'OFFER' ? 'Offer sent to the provider' : 'Order assigned to the provider');
      onSent();
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not send the order');
      // A "no longer waiting" answer means the list is stale.
      void queryClient.invalidateQueries({ queryKey: ['admin-orders', adminId] });
    },
  });
}
