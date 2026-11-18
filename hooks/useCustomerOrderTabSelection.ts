'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Order } from '@/types/order.types';
import { Service } from '@/types/service.types';

interface Options {
  userId?: string;
  activeService: Service | undefined | null;
  dbServices: Service[];
  closePlaceOrderPanel: () => void;
  selectService: (service: Service) => void;
}

/**
 * Which order tab is open inside a service chat, remembered with its main service so switching service
 * starts on its newest order. A freshly placed order opens as its own tab in the chat of its main service.
 */
export function useCustomerOrderTabSelection({ userId, activeService, dbServices, closePlaceOrderPanel, selectService }: Options) {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<{ categoryId: string; orderId: string | null } | null>(null);
  const selectedOrderId = selection?.categoryId === activeService?.categoryId ? selection?.orderId ?? null : null;

  const selectOrderTab = (orderId: string | null) => {
    if (activeService) setSelection({ categoryId: activeService.categoryId, orderId });
  };

  const handleOrderPlaced = (order: Order) => {
    const orderedService = dbServices.find((service) => service.id === order.serviceId);
    closePlaceOrderPanel();
    queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] });
    if (!orderedService) return;
    selectService(orderedService);
    setSelection({ categoryId: orderedService.categoryId, orderId: order.id });
    toast.success(`Order #${order.referenceCode} placed`);
  };

  return { selectedOrderId, selectOrderTab, handleOrderPlaced };
}
