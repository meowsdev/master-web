'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AssignTechnicianModal } from '@/components/modals/AssignTechnicianModal';
import { ProviderCompletionModal } from '@/components/modals/ProviderCompletionModal';
import { ProviderPriceEditModal } from '@/components/modals/ProviderPriceEditModal';
import { Order } from '@/types/order.types';

export type ProviderOrderModal = 'extraCharge' | 'assign' | 'complete' | null;

interface ProviderOrderModalsProps {
  order: Order;
  userId: string;
  openModal: ProviderOrderModal;
  onClose: () => void;
}

/* The three dialogs behind the plus menu: assign a worker, add an extra charge, finish the work. */
export function ProviderOrderModals({ order, userId, openModal, onClose }: ProviderOrderModalsProps) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });

  return (
    <>
      <ProviderPriceEditModal order={order} isOpen={openModal === 'extraCharge'} onClose={onClose} onPriceUpdated={refresh} isDarkMode={false} />
      <ProviderCompletionModal order={order} isOpen={openModal === 'complete'} onClose={onClose} isDarkMode={false} />
      <AssignTechnicianModal order={order} isOpen={openModal === 'assign'} onClose={onClose} onAssigned={refresh} isDarkMode={false} />
    </>
  );
}
