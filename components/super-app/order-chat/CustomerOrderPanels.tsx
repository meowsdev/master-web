'use client';

import { useOrderDetailsPanel } from '@/hooks/useOrderDetailsPanel';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { Order } from '@/types/order.types';
import { AdvancePaymentPanel } from './AdvancePaymentPanel';
import { OrderDetailsPanel } from './OrderDetailsPanel';
import { RevisionRequestPanel } from './RevisionRequestPanel';

/* The order's details (open on wide screens), the panel Pay Now opened, or Send for revision. Moving to another order closes it. */
export function CustomerOrderPanels({ order, userId }: { order: Order; userId: string }) {
  const kind = useOrderPanelStore((state) => state.kind);
  const openOrderId = useOrderPanelStore((state) => state.orderId);
  const details = useOrderDetailsPanel(order.id);

  if (details.isOpen) return <OrderDetailsPanel order={order} viewer="CUSTOMER" onClose={details.close} />;
  if (kind === 'advance' && openOrderId === order.id) return <AdvancePaymentPanel order={order} userId={userId} onClose={details.close} />;
  if (kind === 'revision' && openOrderId === order.id) return <RevisionRequestPanel order={order} onClose={details.close} />;
  return null;
}
