'use client';

import { useOrderDetailsPanel } from '@/hooks/useOrderDetailsPanel';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { Order } from '@/types/order.types';
import { OrderDetailsPanel } from '../order-chat/OrderDetailsPanel';
import { AssignWorkerPanel } from './panels/AssignWorkerPanel';
import { ExtraChargePanel } from './panels/ExtraChargePanel';
import { SendQuotePanel } from './panels/SendQuotePanel';
import { WorkCompletePanel } from './panels/WorkCompletePanel';
import { ExpenseClaimPanel } from '../order-chat/ExpenseClaimPanel';
import { ExpenseReviewPanel } from '../order-chat/ExpenseReviewPanel';

/* The order's details (open on wide screens), or the panel the + menu opened. Moving to another order closes it. */
export function ProviderOrderPanels({ order, userId, viewer = 'PROVIDER' }: { order: Order; userId: string; viewer?: 'PROVIDER' | 'TECHNICIAN' }) {
  const kind = useOrderPanelStore((state) => state.kind);
  const openOrderId = useOrderPanelStore((state) => state.orderId);
  const details = useOrderDetailsPanel(order.id);
  const close = details.close;

  if (openOrderId !== order.id) return null;
  if (details.isOpen) return <OrderDetailsPanel order={order} viewer={viewer} onClose={close} />;
  if (kind === 'extraCharge') return <ExtraChargePanel order={order} userId={userId} onClose={close} />;
  if (kind === 'quote') return <SendQuotePanel order={order} userId={userId} onClose={close} />;
  if (kind === 'complete') return <WorkCompletePanel order={order} onClose={close} />;
  if (kind === 'assign') return <AssignWorkerPanel order={order} userId={userId} onClose={close} />;
  if (kind === 'expenseClaim') return <ExpenseClaimPanel order={order} userId={userId} viewer={viewer} onClose={close} />;
  // The provider reviews the technician's costs, or costs the admin sent back.
  if (kind === 'expenseReview' && viewer === 'PROVIDER') return <ExpenseReviewPanel order={order} userId={userId} reviewer="PROVIDER" onClose={close} />;
  return null;
}
