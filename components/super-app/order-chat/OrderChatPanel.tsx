'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';
import { useOrderChat } from '@/hooks/useOrderChat';
import { useExtraCharges } from '@/hooks/useExtraCharges';
import { useOrderTimeline } from '@/hooks/useOrderTimeline';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { AdvancePaymentCard } from './AdvancePaymentCard';
import { AssignmentCard } from './AssignmentCard';
import { CustomerOrderPanels } from './CustomerOrderPanels';
import { CompletionCard } from './CompletionCard';
import { RevisionCard } from './RevisionCard';
import { CustomerRatingNote } from './CustomerRatingNote';
import { ExtraChargeCard } from './ExtraChargeCard';
import { QuoteCard } from './QuoteCard';
import { MessageBubble } from './MessageBubble';
import { OrderChatComposer } from './OrderChatComposer';
import { ReviewCard } from './ReviewCard';
import { OrderDetailCard } from './OrderDetailCard';
import { OrderHoldBanner } from './OrderHoldBar';
import { OrderStatusHistory } from './OrderStatusHistory';

interface OrderChatPanelProps {
  order: Order;
  userId: string;
  onOpenOrders?: () => void;
}

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(message) ? message[0] : message || fallback;
};

/*
 * One order's tab: the order card, then the chat between the customer and whoever is
 * handling it. Messages carry the order id, so they never mix with General Chat.
 */
export function OrderChatPanel({ order, userId }: OrderChatPanelProps) {
  const queryClient = useQueryClient();
  const openPanel = useOrderPanelStore((state) => state.open);
  const { messages, draft, setDraft, submit, canSend } = useOrderChat(order, userId, 'CUSTOMER');

  const { requests: extraCharges, approve, reject, isAnswering } = useExtraCharges(order.id, userId);

  const timeline = useOrderTimeline(order, messages, extraCharges);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [timeline.length]);

  const cancelOrder = useMutation({
    mutationFn: () => ordersService.updateStatus(order.id, OrderStatus.CANCELLED),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] }),
    onError: (error) => toast.error(apiErrorMessage(error, 'This order could not be cancelled')),
  });

  return (
    <>
      <OrderHoldBanner order={order} />
      <div className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto bg-surface p-[16px]">
        {timeline.map((entry) => {
          switch (entry.kind) {
            case 'order':
              return <OrderDetailCard key={entry.key} order={order} onPayNow={() => openPanel(order.id, 'advance')} onCancel={() => cancelOrder.mutate()} isCancelling={cancelOrder.isPending} />;
            case 'assignment':
              return <AssignmentCard key={entry.key} order={order} />;
            case 'extraCharge':
              return (
                <ExtraChargeCard
                  key={entry.key}
                  request={entry.request}
                  isAnswering={isAnswering}
                  onApprove={() => approve.mutate(entry.request.id)}
                  onReject={() => reject.mutate(entry.request.id)}
                />
              );
            case 'advance':
              return <AdvancePaymentCard key={entry.key} order={order} index={entry.index} viewer="CUSTOMER" />;
            case 'completion':
              return <CompletionCard key={entry.key} order={order} userId={userId} />;
            case 'review':
              return <ReviewCard key={entry.key} order={order} userId={userId} />;
            case 'message':
              return <MessageBubble key={entry.key} message={entry.message} isMine={entry.message.senderId === userId} />;
          }
        })}
        {/* Custom order: the provider's price after the visit, with Accept / Reject. */}
        <QuoteCard order={order} userId={userId} viewer="CUSTOMER" />
        {/* Completed: what the provider said about the customer. */}
        <CustomerRatingNote order={order} viewer="CUSTOMER" />
        {/* 7-day warranty: send it back for revision, or see the one that is running. */}
        <RevisionCard order={order} />
        {/* Why the status changed, written by staff or the provider. */}
        <OrderStatusHistory orderId={order.id} />
        {/* Newest at the bottom: the view follows new items like WhatsApp. */}
        <div ref={bottomRef} />
      </div>

      <CustomerOrderPanels order={order} userId={userId} />
      <OrderChatComposer
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={submit}
        canSend={canSend}
        isDisabled={order.isChatOpen === false}
        disabledHint={order.orderStatus === OrderStatus.PENDING ? 'প্রোভাইডার অর্ডার accept করলে চ্যাট চালু হবে' : undefined}
      />
    </>
  );
}
