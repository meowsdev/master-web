'use client';

import { useEffect } from 'react';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { Order } from '@/types/order.types';
import { AdvancePaymentPanel } from './AdvancePaymentPanel';

/* The panel Pay Now opened, if it belongs to this order. Moving to another order closes it. */
export function CustomerOrderPanels({ order, userId }: { order: Order; userId: string }) {
  const kind = useOrderPanelStore((state) => state.kind);
  const openOrderId = useOrderPanelStore((state) => state.orderId);
  const close = useOrderPanelStore((state) => state.close);

  useEffect(() => close, [order.id, close]);

  if (kind === 'advance' && openOrderId === order.id) return <AdvancePaymentPanel order={order} userId={userId} onClose={close} />;
  return null;
}
