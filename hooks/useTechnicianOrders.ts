'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';

/*
 * The key is the provider order list's key on purpose: a technician works the same order screens as a provider
 * (extra charge, finish work...) and those already refresh this key. A technician and a provider are never the
 * same signed-in user, and the key carries the user id (AGENTS.md §7), so nothing is shared between them.
 */
const technicianOrdersKey = (userId: string | undefined) => ['provider-assigned-orders', userId];

/**
 * The orders a technician's provider put them on, and nothing else: the backend answers `GET /orders` for a
 * technician with exactly those.
 */
export function useTechnicianOrders(userId: string | undefined) {
  return useQuery<Order[]>({
    queryKey: technicianOrdersKey(userId),
    queryFn: () => ordersService.getOrders(),
    enabled: Boolean(userId),
    refetchInterval: 5000,
  });
}

/** Moves one job along (for example starts it). The backend decides which changes are allowed. */
export function useTechnicianStatusUpdate(userId: string | undefined, orderId: string | undefined) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersService.updateStatus(orderId!, status),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: technicianOrdersKey(userId) });
      toast.success(`Order #${updated.referenceCode ?? ''} updated`);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'Could not update the order');
    },
  });
  return { updateStatus: (status: OrderStatus) => mutation.mutateAsync(status).then(() => undefined, () => undefined), isUpdating: mutation.isPending };
}
