'use client';

import { useMyOrders } from '@/hooks/useMyOrders';
import { selectOpenOrderId, useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { ConversationHeader } from '../ConversationHeader';
import { OrderChatPanel } from '../order-chat/OrderChatPanel';
import { buildOrderTabLabel } from '../order-chat/order-labels';
import { OrderAvatar } from './OrderAvatar';

interface CustomerOrdersCanvasProps {
  userId: string;
  onBackMobile: () => void;
  onOpenOrdersDrawer: () => void;
}

/*
 * Right side of the Orders view: the chosen order's chat with its full history.
 * The header names the order, who handles it and the provider's company, like the Figma chat header.
 */
export function CustomerOrdersCanvas({ userId, onBackMobile, onOpenOrdersDrawer }: CustomerOrdersCanvasProps) {
  const { data: orders = [] } = useMyOrders(userId);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(userId));
  const selectOrder = useOrderHistoryStore((state) => state.select);
  const order = orders.find((item) => item.id === openOrderId);

  if (!order) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#f7f5f3] p-[24px] text-center text-[15px] font-medium text-[#697586]">
        Select an order to see its full chat history.
      </div>
    );
  }

  const providerRating = Number(order.provider?.rating);

  return (
    <>
      <ConversationHeader
        picture={<OrderAvatar order={order} sizeClass="size-[36px]" />}
        title={buildOrderTabLabel(order)}
        ratingLabel={providerRating > 0 ? providerRating.toFixed(1) : 'New'}
        backLabel="Back to orders"
        onBack={onBackMobile}
        menuItems={[
          { label: 'Order details', onSelect: onOpenOrdersDrawer },
          { label: 'Close chat', onSelect: () => selectOrder(userId, null) },
        ]}
      />
      {/* key: a different order starts a fresh timeline and scroll position. */}
      <OrderChatPanel key={order.id} order={order} userId={userId} onOpenOrders={onOpenOrdersDrawer} />
    </>
  );
}
