'use client';

import { useMyOrders } from '@/hooks/useMyOrders';
import { orderMainServiceId } from '@/lib/main-service';
import { OrderStatus } from '@/types/order.types';

/**
 * The order tabs of one main service: every order of that service whose chat the backend
 * says is open (running, or reopened by a revision), orders still waiting for a provider, and completed ones waiting for the
 * customer's review. Other closed orders live in order history only.
 * Shares the user-scoped cache with the orders drawer, so a placed order shows up at once.
 */
export function useCustomerOrderTabs(userId: string | undefined, categoryId: string | undefined) {
  const { data: orders = [] } = useMyOrders(userId);

  return orders
    // A placed order waiting for a provider is a tab too: the customer sees it (chat opens once a provider accepts).
    .filter((order) => orderMainServiceId(order) === categoryId && (order.isChatOpen || order.isReviewPending || order.orderStatus === OrderStatus.PENDING))
    // Oldest first, so tabs keep their place as new orders are added on the right.
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
