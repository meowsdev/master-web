'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';
import { ProviderOrderFilter } from '@/components/super-app/ProviderOrderList';

interface UseProviderOrdersProps {
  isProvider: boolean;
  userId?: string | null;
}

export function useProviderOrders({ isProvider, userId }: UseProviderOrdersProps) {
  const queryClient = useQueryClient();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProviderOrderFilter>('ALL');

  // Reset active order when userId changes
  useEffect(() => {
    setActiveOrderId(null);
  }, [userId]);

  // Fetch only assigned orders for the authenticated provider (auto-polling every 3s)
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['provider-assigned-orders', userId],
    queryFn: () => ordersService.getOrders(),
    enabled: isProvider && Boolean(userId),
    refetchInterval: isProvider ? 3000 : false,
    staleTime: 1000 * 2,
  });

  // Currently selected active order
  const activeOrder = useMemo(() => {
    if (!activeOrderId) {
      // Auto-select the first pending order if available
      return orders[0] || null;
    }
    return orders.find((o) => o.id === activeOrderId) || null;
  }, [orders, activeOrderId]);

  // Real-time audio chime & toast alert when new pending job dispatch arrives
  const previousPendingIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Cross-tab real-time dispatch listener
  useEffect(() => {
    if (!isProvider || typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('master_job_dispatch');

    channel.onmessage = (event) => {
      if (event.data?.type === 'NEW_ORDER_DISPATCHED') {
        refetch();
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.6;
          audio.play().catch(() => {});
        } catch {
          // ignore
        }

        toast.info(
          `🔔 New Job Dispatch: "${event.data?.serviceName || 'On-Demand Service'}" arrived! Tap to accept.`,
          { duration: 7000 }
        );
      }
    };

    return () => {
      channel.close();
    };
  }, [isProvider, refetch]);

  useEffect(() => {
    if (!isProvider) return;
    const currentPendingIds = new Set(
      orders.filter((o) => o.orderStatus === OrderStatus.PENDING).map((o) => o.id)
    );

    if (isFirstLoadRef.current) {
      previousPendingIdsRef.current = currentPendingIds;
      isFirstLoadRef.current = false;
      if (currentPendingIds.size > 0) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.6;
          audio.play().catch(() => {});
        } catch {
          // audio blocked or unavailable
        }

        toast.info(
          `🔔 You have ${currentPendingIds.size} pending job dispatch(es) waiting! Tap to review & accept.`,
          { duration: 7000 }
        );
      }
      return;
    }

    // Check if new pending orders arrived
    const newArrivals = Array.from(currentPendingIds).filter(
      (id) => !previousPendingIdsRef.current.has(id)
    );

    if (newArrivals.length > 0) {
      const newOrder = orders.find((o) => o.id === newArrivals[0]);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } catch {
        // audio playback blocked or unavailable
      }

      toast.info(
        `🔔 New Job Dispatch: "${newOrder?.service?.name || 'On-Demand Service'}" (৳${
          newOrder?.totalPrice || 500
        })! Tap to accept.`,
        { duration: 7000 }
      );
    }

    previousPendingIdsRef.current = currentPendingIds;
  }, [orders, isProvider]);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersService.updateStatus(orderId, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders-drawer'] });
      toast.success(`Order #${updated.id.slice(0, 8).toUpperCase()} updated to ${updated.orderStatus}!`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update order status';
      toast.error(msg);
    },
  });

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!activeOrderId) return;
    await updateStatusMutation.mutateAsync({ orderId: activeOrderId, status });
  };

  return {
    orders,
    isLoading,
    refetch,
    activeOrderId,
    setActiveOrderId,
    activeOrder,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    handleUpdateStatus,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
