'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon } from '@hugeicons/core-free-icons';
import { chatService } from '@/services/chat.service';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';
import { useExtraCharges } from '@/hooks/useExtraCharges';
import { useOrderTimeline } from '@/hooks/useOrderTimeline';
import { AssignmentCard } from './AssignmentCard';
import { CompletionCard } from './CompletionCard';
import { ExtraChargeCard } from './ExtraChargeCard';
import { MessageBubble } from './MessageBubble';
import { ReviewCard } from './ReviewCard';
import { OrderDetailCard } from './OrderDetailCard';

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
export function OrderChatPanel({ order, userId, onOpenOrders }: OrderChatPanelProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const serviceId = order.service?.id ?? order.serviceId;

  // One conversation per main service; getOrCreate returns the same one for every order of it.
  const { data: conversation } = useQuery({
    queryKey: ['order-conversation', userId, order.service?.categoryId],
    queryFn: () => chatService.getOrCreateConversation({ serviceId }),
    staleTime: Infinity,
  });

  const messagesKey = ['order-chat-messages', userId, order.id];
  const { data: messages = [] } = useQuery({
    queryKey: messagesKey,
    queryFn: () => chatService.getMessages(conversation!.id, order.id),
    enabled: Boolean(conversation),
    refetchInterval: 4000,
  });

  const sendMessage = useMutation({
    mutationFn: (text: string) => chatService.sendMessage({ conversationId: conversation!.id, orderId: order.id, text }),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: messagesKey });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Message could not be sent')),
  });

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

  const submit = () => {
    if (draft.trim() && conversation) sendMessage.mutate(draft.trim());
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto bg-[#f7f5f3] p-[16px]">
        {timeline.map((entry) => {
          switch (entry.kind) {
            case 'order':
              return <OrderDetailCard key={entry.key} order={order} onPayNow={() => onOpenOrders?.()} onCancel={() => cancelOrder.mutate()} isCancelling={cancelOrder.isPending} />;
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
            case 'completion':
              return <CompletionCard key={entry.key} order={order} userId={userId} />;
            case 'review':
              return <ReviewCard key={entry.key} order={order} userId={userId} />;
            case 'message':
              return <MessageBubble key={entry.key} message={entry.message} isMine={entry.message.senderId === userId} />;
          }
        })}
        {/* Newest at the bottom: the view follows new items like WhatsApp. */}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex shrink-0 items-center gap-[10px] bg-[#f7f5f3] px-[16px] pb-[16px] pt-[8px]"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={1000}
          disabled={order.isChatOpen === false}
          placeholder="Type a message"
          className="h-[44px] min-w-0 flex-1 rounded-[22px] bg-white px-[18px] text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#9aa4b2]"
        />
        <button
          type="submit"
          disabled={!draft.trim() || !conversation || sendMessage.isPending}
          aria-label="Send message"
          className="flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-[#1daa61] text-white disabled:opacity-50"
        >
          <HugeiconsIcon icon={SentIcon} size={20} />
        </button>
      </form>
    </>
  );
}
