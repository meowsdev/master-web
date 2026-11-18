'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getChatSocket } from '@/lib/socket';

interface ProviderOfferAlertsProps {
  isProvider: boolean;
  userId?: string | null;
  /** New orders waiting for this provider's answer: shown in the browser tab title. */
  pendingCount: number;
  /** The app's sound (it already respects the Sound Notifications setting). */
  playSound: (type: 'offer') => void;
}

/**
 * Makes a new order reach a provider's open app at once. The backend sends `orderOffer` to the provider's
 * private socket room the moment the offer is saved; we only refresh the order list, and the list's own
 * new-order check plays the sound and shows the toast (one alert path, never two). If the socket is down,
 * the list's regular refresh still brings the order in. The tab title shows how many orders are waiting.
 */
export function useProviderOfferAlerts({ isProvider, userId, pendingCount, playSound }: ProviderOfferAlertsProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isProvider || !userId) return;
    const socket = getChatSocket();
    if (!socket) return;

    const refreshOrders = () => void queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });
    // An admin gave this provider an order directly. It is already theirs (not a pending offer), so the list's
    // new-offer check stays quiet: tell them here.
    const handleAssigned = (info: { referenceCode?: string | null; serviceName?: string | null }) => {
      refreshOrders();
      playSound('offer');
      toast.info(`📌 An order was assigned to you${info.serviceName ? `: ${info.serviceName}` : ''}${info.referenceCode ? ` (#${info.referenceCode})` : ''}`, { duration: 8000 });
    };
    socket.on('orderOffer', refreshOrders);
    socket.on('orderAssigned', handleAssigned);
    // An offer sent while the connection was down is picked up as soon as it is back.
    socket.on('connect', refreshOrders);
    return () => {
      socket.off('orderOffer', refreshOrders);
      socket.off('orderAssigned', handleAssigned);
      socket.off('connect', refreshOrders);
    };
  }, [isProvider, userId, queryClient, playSound]);

  useEffect(() => {
    if (!isProvider || typeof document === 'undefined') return;
    const baseTitle = document.title.replace(/^\(\d+\) /, '');
    document.title = pendingCount > 0 ? `(${pendingCount}) ${baseTitle}` : baseTitle;
    return () => {
      document.title = baseTitle;
    };
  }, [isProvider, pendingCount]);
}
