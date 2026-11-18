'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderTechnicianService } from '@/services/order-technician.service';

/* Keys carry the signed-in user's id (AGENTS.md §7). */
export function useOrderTechnicians(userId: string, orderId: string) {
  return useQuery({
    queryKey: ['order-technicians', userId, orderId],
    queryFn: () => orderTechnicianService.list(orderId),
  });
}

export function useSetOrderTechnician(userId: string, orderId: string, onDone: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (technicianId: string | null) => orderTechnicianService.set(orderId, technicianId),
    onSuccess: (_result, technicianId) => {
      // The order card and its tab name show the worker, so the orders are read again.
      void queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });
      void queryClient.invalidateQueries({ queryKey: ['order-technicians', userId, orderId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-orders', userId] });
      toast.success(technicianId ? 'Worker assigned' : 'Worker removed from the order');
      onDone();
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not change the worker');
    },
  });
}
