'use client';

import { useTechnicianOrders, useTechnicianStatusUpdate } from '@/hooks/useTechnicianOrders';
import { selectOpenOrderId, useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { ChatEmptyHeader } from '../ChatEmptyHeader';
import { ProviderOrderWorkspace } from '../provider/ProviderOrderWorkspace';

interface TechnicianCanvasProps {
  userId: string;
  onBack: () => void;
  onSwitchAccount: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
}

/*
 * The technician's main area: the job they opened, or an empty canvas until they pick one. A job is worked with the
 * same screen as a provider's (details, extra charges, payment, chat, finish work); only assigning a worker and
 * rating the customer are left out, and the backend refuses a technician those anyway.
 */
export function TechnicianCanvas({ userId, onBack, onSwitchAccount, onStartCall }: TechnicianCanvasProps) {
  const { data: orders = [] } = useTechnicianOrders(userId);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(userId));
  // Only an order that is really in this technician's list can be shown, whatever id was remembered.
  const order = orders.find((item) => item.id === openOrderId);
  const { updateStatus, isUpdating } = useTechnicianStatusUpdate(userId, order?.id);

  if (!order) {
    return (
      <>
        <ChatEmptyHeader onSwitchAccount={onSwitchAccount} menuItems={[]} />
        <div className="flex flex-1 items-center justify-center bg-surface text-[14px] font-medium text-muted">Choose a job to see its details.</div>
      </>
    );
  }
  return <ProviderOrderWorkspace key={order.id} order={order} userId={userId} viewer="TECHNICIAN" onBack={onBack} onUpdateStatus={updateStatus} isUpdatingStatus={isUpdating} onStartCall={onStartCall} />;
}
