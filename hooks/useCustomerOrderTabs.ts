'use client';

import { useMyOrders } from '@/hooks/useMyOrders';

/**
 * The order tabs of one main service: every order of that service whose chat the backend
 * says is open (running, or reopened by a revision), plus completed ones still waiting for the
 * customer's review. Other closed orders live in order history only.
 * Shares the user-scoped cache with the orders drawer, so a placed order shows up at once.
 */
export function useCustomerOrderTabs(userId: string | undefined, categoryId: string | undefined) {
  const { data: orders = [] } = useMyOrders(userId);

  return orders
    .filter((order) => order.service?.categoryId === categoryId && (order.isChatOpen || order.isReviewPending))
    // Oldest first, so tabs keep their place as new orders are added on the right.
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
