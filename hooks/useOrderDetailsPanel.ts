'use client';

import { useEffect } from 'react';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';

/** Same breakpoint as the layout's `md:`: from here the chat and a side panel fit next to each other. */
const WIDE_SCREEN_QUERY = '(min-width: 768px)';

/**
 * The "Order details" side panel of one order. Opening an order on a wide screen shows its details on the
 * right at once; on a phone the panel would cover the chat, so it opens only from the header. Moving to
 * another order closes whatever panel the previous one had open.
 */
export function useOrderDetailsPanel(orderId: string) {
  const kind = useOrderPanelStore((state) => state.kind);
  const openOrderId = useOrderPanelStore((state) => state.orderId);
  const open = useOrderPanelStore((state) => state.open);
  const close = useOrderPanelStore((state) => state.close);

  useEffect(() => {
    if (window.matchMedia(WIDE_SCREEN_QUERY).matches) open(orderId, 'orderDetails');
    return close;
  }, [orderId, open, close]);

  return {
    isOpen: kind === 'orderDetails' && openOrderId === orderId,
    open: () => open(orderId, 'orderDetails'),
    close,
  };
}
