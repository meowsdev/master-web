'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Order } from '@/types/order.types';
import { Service } from '@/types/service.types';
import { orderMainServiceId } from '@/lib/main-service';

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
  // Starts from the address (?service=<main service>&tab=services|<order id>), so a reload or a shared link
  // lands on the same tab; the chat itself is opened below once the chat list has loaded.
  const [selection, setSelection] = useState<{ categoryId: string; orderId: string | null } | null>(readAddressSelection);
  const selectedOrderId = selection?.categoryId === activeService?.categoryId ? selection?.orderId ?? null : null;

  const selectOrderTab = (orderId: string | null) => {
    if (activeService) setSelection({ categoryId: activeService.categoryId, orderId });
  };

  const handleOrderPlaced = (order: Order) => {
    // The chat list holds main services: the order opens as a tab in the chat of its main service.
    const mainServiceId = orderMainServiceId(order);
    const orderedService = dbServices.find((service) => service.id === mainServiceId);
    closePlaceOrderPanel();
    queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] });
    if (!orderedService) return;
    selectService(orderedService);
    setSelection({ categoryId: orderedService.categoryId, orderId: order.id });
    toast.success(`Order #${order.referenceCode} placed`);
  };

  // Opens the chat named in the address once, when the chat list has loaded. Until then the address is left alone.
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current || dbServices.length === 0 || typeof window === 'undefined') return;
    hasRestoredRef.current = true;
    const target = dbServices.find((service) => service.id === new URLSearchParams(window.location.search).get('service'));
    if (target) selectService(target);
  }, [dbServices, selectService]);

  // Every change of chat or tab is written back to the address.
  const activeCategoryId = activeService?.categoryId ?? null;
  useEffect(() => {
    if (!hasRestoredRef.current || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (activeCategoryId) url.searchParams.set('service', activeCategoryId);
    else url.searchParams.delete('service');
    if (activeCategoryId && selectedOrderId) url.searchParams.set('tab', selectedOrderId);
    else url.searchParams.delete('tab');
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
  }, [activeCategoryId, selectedOrderId]);

  return { selectedOrderId, selectOrderTab, handleOrderPlaced };
}

function readAddressSelection(): { categoryId: string; orderId: string | null } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('service');
  return categoryId ? { categoryId, orderId: params.get('tab') } : null;
}
