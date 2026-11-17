'use client';

import { useEffect, useRef } from 'react';
import { useExtraCharges } from '@/hooks/useExtraCharges';
import { useOrderChat } from '@/hooks/useOrderChat';
import { useOrderTimeline } from '@/hooks/useOrderTimeline';
import { Order, OrderStatus } from '@/types/order.types';
import { ConversationHeader } from '../ConversationHeader';
import { AdvancePaymentCard } from '../order-chat/AdvancePaymentCard';
import { ExtraChargeCard } from '../order-chat/ExtraChargeCard';
import { MessageBubble } from '../order-chat/MessageBubble';
import { ReviewCard } from '../order-chat/ReviewCard';
import { CustomerAvatar } from './CustomerAvatar';
import { CustomerRatingCard } from './CustomerRatingCard';
import { ProviderOrderComposer } from './ProviderOrderComposer';
import { ProviderOrderPanels } from './ProviderOrderPanels';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { ProviderPendingActions } from './ProviderPendingActions';
import { ProviderOrderInfoCard } from './ProviderOrderInfoCard';
import { ProviderPaymentNote } from './ProviderPaymentNote';
import { providerOrderTitle } from './provider-order-filters';

interface ProviderOrderWorkspaceProps {
  order: Order;
  userId: string;
  onBack: () => void;
  onUpdateStatus: (status: OrderStatus) => Promise<void>;
  isUpdatingStatus: boolean;
  onStartCall: (type: 'voice' | 'video') => void;
}

/*
 * One order for the provider: its full info, the extra charges and payment so far, and the live chat
 * with the customer, all on one timeline (oldest first). Accept / Decline sit on the order card; assign, extra charge and finish are in the + menu of the message box.
 */
export function ProviderOrderWorkspace({ order, userId, onBack, onUpdateStatus, isUpdatingStatus, onStartCall }: ProviderOrderWorkspaceProps) {
  const { messages, draft, setDraft, submit, canSend } = useOrderChat(order, userId, 'PROVIDER');
  const { requests: extraCharges } = useExtraCharges(order.id, userId);
  const timeline = useOrderTimeline(order, messages, extraCharges);
  const openPanel = useOrderPanelStore((state) => state.open);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [timeline.length]);

  return (
    <>
      <ConversationHeader
        picture={<CustomerAvatar order={order} sizeClass="size-[36px]" />}
        title={providerOrderTitle(order)}
        ratingLabel="New"
        backLabel="Back to orders"
        onBack={onBack}
        menuItems={[
          { label: 'Voice call', onSelect: () => onStartCall('voice') },
          { label: 'Video call', onSelect: () => onStartCall('video') },
          { label: 'Open full order page', onSelect: () => window.open(`/orders/${order.id}`, '_blank') },
        ]}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto bg-[#f7f5f3] p-[16px]">
        {timeline.map((entry) => {
          switch (entry.kind) {
            case 'order':
              return <ProviderOrderInfoCard key={entry.key} order={order} actions={<ProviderPendingActions order={order} onUpdateStatus={onUpdateStatus} isUpdatingStatus={isUpdatingStatus} />} />;
            case 'extraCharge':
              return <ExtraChargeCard key={entry.key} request={entry.request} viewer="PROVIDER" isAnswering={false} onApprove={() => {}} onReject={() => {}} />;
            case 'advance':
              return <AdvancePaymentCard key={entry.key} order={order} index={entry.index} viewer="PROVIDER" />;
            case 'completion':
              return <ProviderPaymentNote key={entry.key} order={order} />;
            case 'review':
              return order.providerReview ? <ReviewCard key={entry.key} order={order} userId={userId} /> : null;
            case 'message':
              return <MessageBubble key={entry.key} message={entry.message} isMine={entry.message.senderId === userId} />;
            default:
              return null;
          }
        })}
        {/* Completed: the provider rates the customer. */}
        <CustomerRatingCard order={order} userId={userId} />
        <div ref={bottomRef} />
      </div>

      <ProviderOrderComposer order={order} draft={draft} onDraftChange={setDraft} onSubmit={submit} canSend={canSend} onChooseAction={(kind) => openPanel(order.id, kind)} />
      <ProviderOrderPanels order={order} userId={userId} />
    </>
  );
}
