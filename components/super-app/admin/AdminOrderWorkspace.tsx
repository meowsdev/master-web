'use client';

import { useEffect, useRef } from 'react';
import { useExtraCharges } from '@/hooks/useExtraCharges';
import { useOrderDetailsPanel } from '@/hooks/useOrderDetailsPanel';
import { OrderDetailsPanel } from '../order-chat/OrderDetailsPanel';
import { useOrderChat } from '@/hooks/useOrderChat';
import { useOrderTimeline } from '@/hooks/useOrderTimeline';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { Order, OrderStatus } from '@/types/order.types';
import { ConversationHeader } from '../ConversationHeader';
import { AdvancePaymentCard } from '../order-chat/AdvancePaymentCard';
import { ExtraChargeCard } from '../order-chat/ExtraChargeCard';
import { MessageBubble } from '../order-chat/MessageBubble';
import { OrderChatComposer } from '../order-chat/OrderChatComposer';
import { CustomerRatingNote } from '../order-chat/CustomerRatingNote';
import { RevisionCard } from '../order-chat/RevisionCard';
import { RevisionRequestPanel } from '../order-chat/RevisionRequestPanel';
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
  const openPanel = useOrderPanelStore((state) => state.open);
  // Who the customer, provider and technician are, and everything else about the order, on the right.
  const details = useOrderDetailsPanel(order.id);
  // Nobody has taken it yet: staff who may assign can send it to a provider.
  const isWaitingForProvider = order.orderStatus === OrderStatus.PENDING;
  const { canAssignOrders, canSendToRevision } = useStaffPermissions();
  const panelKind = useOrderPanelStore((state) => state.kind);
  const panelOrderId = useOrderPanelStore((state) => state.orderId);
  const closePanel = useOrderPanelStore((state) => state.close);
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
        onOpenTitle={details.open}
        menuItems={[
          { label: 'Order details', onSelect: details.open },
          { label: 'Open full order page', onSelect: () => window.open(`/orders/${order.id}`, '_blank') },
        ]}
      />

      {isWaitingForProvider && (
        <div className="flex shrink-0 items-center justify-between gap-[12px] border-b border-[#e5e5e5] bg-[#fff4e5] px-[16px] py-[8px]">
          <p className="min-w-0 text-[13px] font-medium text-[#b7791f]">
            <span className="font-semibold">{order.needsAttention ? 'Needs a provider' : 'Waiting for a provider'}</span>
            {order.offerCount ? ` · offered to ${order.offerCount} so far` : ''}
          </p>
          {canAssignOrders && (
          <button
            type="button"
            onClick={() => openPanel(order.id, 'adminAssign')}
            className="h-[34px] shrink-0 cursor-pointer rounded-[10px] bg-[#1daa61] px-[14px] text-[13px] font-semibold text-white hover:bg-[#189452]"
          >
            Send to a provider
          </button>
          )}
        </div>
      )}

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
        {/* Completed: the provider's rating of the customer. */}
        <CustomerRatingNote order={order} viewer="ADMIN" />
        {/* 7-day warranty: staff who may (admin) can send it back for revision. */}
        <RevisionCard order={order} canRequest={canSendToRevision} />
        <div ref={bottomRef} />
      </div>

      <OrderChatComposer draft={draft} onDraftChange={setDraft} onSubmit={submit} canSend={canSend} isDisabled={order.isChatOpen === false} />
      {details.isOpen && <OrderDetailsPanel order={order} viewer="ADMIN" onClose={details.close} />}
      {panelKind === 'revision' && panelOrderId === order.id && <RevisionRequestPanel order={order} onClose={closePanel} />}
    </>
  );
}
