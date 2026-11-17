'use client';

import { useEffect, useRef } from 'react';
import { useExtraCharges } from '@/hooks/useExtraCharges';
import { useOrderChat } from '@/hooks/useOrderChat';
import { useOrderTimeline } from '@/hooks/useOrderTimeline';
import { Order } from '@/types/order.types';
import { ConversationHeader } from '../ConversationHeader';
import { AdvancePaymentCard } from '../order-chat/AdvancePaymentCard';
import { ExtraChargeCard } from '../order-chat/ExtraChargeCard';
import { MessageBubble } from '../order-chat/MessageBubble';
import { OrderChatComposer } from '../order-chat/OrderChatComposer';
import { ReviewCard } from '../order-chat/ReviewCard';
import { CustomerAvatar } from '../provider/CustomerAvatar';
import { ProviderOrderInfoCard } from '../provider/ProviderOrderInfoCard';
import { ProviderPaymentNote } from '../provider/ProviderPaymentNote';
import { providerOrderTitle } from '../provider/provider-order-filters';

/*
 * One order for the admin: full info of both sides, everything that happened (extra charges, advances,
 * payment, review) and the live chat, which the admin can read and write into. Nothing here changes the
 * order itself; only messages are sent.
 */
export function AdminOrderWorkspace({ order, userId, onBack }: { order: Order; userId: string; onBack: () => void }) {
  const { messages, draft, setDraft, submit, canSend } = useOrderChat(order, userId, 'ADMIN');
  const { requests: extraCharges } = useExtraCharges(order.id, userId);
  const timeline = useOrderTimeline(order, messages, extraCharges);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [timeline.length]);

  return (
    <>
      <ConversationHeader
        picture={<CustomerAvatar order={order} sizeClass="size-[36px]" />}
        title={providerOrderTitle(order)}
        ratingLabel={order.isAccepted && Number(order.provider?.rating) > 0 ? Number(order.provider?.rating).toFixed(1) : 'New'}
        backLabel="Back to orders"
        onBack={onBack}
        menuItems={[{ label: 'Open full order page', onSelect: () => window.open(`/orders/${order.id}`, '_blank') }]}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto bg-[#f7f5f3] p-[16px]">
        {timeline.map((entry) => {
          switch (entry.kind) {
            case 'order':
              return <ProviderOrderInfoCard key={entry.key} order={order} showParties />;
            case 'extraCharge':
              return <ExtraChargeCard key={entry.key} request={entry.request} viewer="PROVIDER" isAnswering={false} onApprove={() => {}} onReject={() => {}} />;
            case 'advance':
              return <AdvancePaymentCard key={entry.key} order={order} index={entry.index} viewer="PROVIDER" />;
            case 'completion':
              return <ProviderPaymentNote key={entry.key} order={order} viewer="ADMIN" />;
            case 'review':
              return order.providerReview ? <ReviewCard key={entry.key} order={order} userId={userId} /> : null;
            case 'message':
              return <MessageBubble key={entry.key} message={entry.message} isMine={entry.message.senderId === userId} />;
            default:
              return null;
          }
        })}
        <div ref={bottomRef} />
      </div>

      <OrderChatComposer draft={draft} onDraftChange={setDraft} onSubmit={submit} canSend={canSend} isDisabled={order.isChatOpen === false} />
    </>
  );
}
