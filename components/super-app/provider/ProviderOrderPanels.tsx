'use client';

import { useEffect } from 'react';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { Order } from '@/types/order.types';
import { AssignWorkerPanel } from './panels/AssignWorkerPanel';
import { ExtraChargePanel } from './panels/ExtraChargePanel';
import { WorkCompletePanel } from './panels/WorkCompletePanel';

/* The panel the + menu opened, if it belongs to this order. Moving to another order closes it. */
export function ProviderOrderPanels({ order, userId }: { order: Order; userId: string }) {
  const kind = useOrderPanelStore((state) => state.kind);
  const openOrderId = useOrderPanelStore((state) => state.orderId);
  const close = useOrderPanelStore((state) => state.close);

  useEffect(() => close, [order.id, close]);

  if (openOrderId !== order.id) return null;
  if (kind === 'extraCharge') return <ExtraChargePanel order={order} userId={userId} onClose={close} />;
  if (kind === 'complete') return <WorkCompletePanel order={order} onClose={close} />;
  if (kind === 'assign') return <AssignWorkerPanel order={order} onClose={close} />;
  return null;
}
