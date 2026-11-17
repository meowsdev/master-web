'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { Order } from '@/types/order.types';

/**
 * The order tabs of one main service: every order of that service whose chat the backend
 * says is open (running, or reopened by a revision), plus completed ones still waiting for the
 * customer's review. Other closed orders live in order history only.
 * Shares the user-scoped cache with the orders drawer, so a placed order shows up at once.
 */
export function useCustomerOrderTabs(userId: string | undefined, categoryId: string | undefined) {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['my-orders-drawer', userId],
    queryFn: () => ordersService.getOrders(),
    enabled: Boolean(userId),
    staleTime: 10000,
    // The provider accepts, completes and asks for payment on their side; poll so those cards appear.
    refetchInterval: 5000,
  });

  return orders
    .filter((order) => order.service?.categoryId === categoryId && (order.isChatOpen || order.isReviewPending))
    // Oldest first, so tabs keep their place as new orders are added on the right.
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
