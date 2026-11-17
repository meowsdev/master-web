'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { Order } from '@/types/order.types';

/**
 * The signed-in customer's orders. Every customer view (order tabs, the Orders list, the
 * profile counters) shares this one user-scoped cache. The provider acts on their own side,
 * so it is polled to make accepts, payments and completions show up without a reload.
 */
export function useMyOrders(userId: string | undefined) {
  return useQuery<Order[]>({
    queryKey: ['my-orders-drawer', userId],
    queryFn: () => ordersService.getOrders(),
    enabled: Boolean(userId),
    staleTime: 10000,
    refetchInterval: 5000,
  });
}
