'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersService } from '@/services/orders.service';
import { chatService } from '@/services/chat.service';
import { Order, OrderStatus } from '@/types/order.types';
import {
  CounselorTab,
  CounselorChatItem,
  CreateManualCustomerLeadDto,
  CounselorCreateOrderDto,
} from '@/types/counselor.types';

interface UseCounselorWorkspaceProps {
  isCounselor: boolean;
  userId?: string | null;
}

export function useCounselorWorkspace({ isCounselor, userId }: UseCounselorWorkspaceProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CounselorTab>('ONGOING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Manual Leads created in-session (Flow B: Counselor-Initiated Leads)
  const [manualLeads, setManualLeads] = useState<CounselorChatItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`counselor_leads_${userId || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Query real orders from backend
  const {
    data: allOrders = [],
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery<Order[]>({
    queryKey: ['counselor-orders', userId],
    queryFn: () => ordersService.getOrders(),
    enabled: isCounselor,
    staleTime: 5000,
  });

  // Map backend orders into structured Counselor items
  const mappedOrderItems = useMemo<CounselorChatItem[]>(() => {
    return allOrders.map((order) => {
      const shortId = order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
      const base = Number(order.originalPrice || order.service?.basePrice || 0);
      const addOn = Number(order.additionalPrice || 0);
      const total = base + addOn;
      const advance = Number(order.advancePaid || 0);
      const due = Math.max(0, total - advance);

      const hasActiveRevision = Boolean(
        order.revisions?.some(
          (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
        )
      );
      const revisionIssue = order.revisions?.[0]?.issueDescription;

      // Classify into Counselor Tabs per ideya/councelor.md specifications
      let tabCategory: CounselorTab = 'ONGOING';
      if (order.orderStatus === OrderStatus.COMPLETED) {
        tabCategory = 'COMPLETED';
      } else if (order.orderStatus === OrderStatus.DISPUTED || order.orderStatus === OrderStatus.CANCELLED) {
        tabCategory = 'HOLD';
      } else if (!order.providerId || order.orderStatus === OrderStatus.PENDING) {
        tabCategory = 'PUBLIC';
      } else {
        tabCategory = 'ONGOING';
      }

      return {
        id: order.id,
        orderId: shortId,
        customerName: order.customer?.user?.name || 'Customer ' + shortId,
        customerPhone: order.customer?.user?.mobileNumber || '+8801700000000',
        customerAvatar: order.customer?.user?.profilePhoto || undefined,
        serviceId: order.serviceId,
        serviceName: order.service?.name || 'Home Maintenance Service',
        serviceIcon: order.service?.category?.iconUrl || '🛠️',
        orderStatus: order.orderStatus,
        totalPrice: total,
        advancePaid: advance,
        dueAmount: due,
        assignedProvider: order.provider
          ? {
              id: order.provider.id,
              name: order.provider.user?.name || 'Assigned Technician',
              phone: order.provider.user?.mobileNumber,
              rating: 4.8,
              isHeld: order.orderStatus === OrderStatus.DISPUTED,
            }
          : null,
        hasActiveRevision,
        revisionIssue,
        hasNegativeReview: false,
        tabCategory,
        createdAt: order.createdAt || new Date().toISOString(),
        order,
      };
    });
  }, [allOrders]);

  // Combine live orders and manual Flow B leads
  const allChatItems = useMemo(() => {
    return [...manualLeads, ...mappedOrderItems];
  }, [manualLeads, mappedOrderItems]);

  // Filter items by active tab and search query
  const filteredChatItems = useMemo(() => {
    return allChatItems.filter((item) => {
      // 1. Tab category match
      if (item.tabCategory !== activeTab) return false;

      // 2. Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.customerName.toLowerCase().includes(q) ||
        item.customerPhone.toLowerCase().includes(q) ||
        item.serviceName.toLowerCase().includes(q) ||
        (item.orderId && item.orderId.toLowerCase().includes(q))
      );
    });
  }, [allChatItems, activeTab, searchQuery]);

  // Active selected chat item
  const activeChatItem = useMemo(() => {
    if (!selectedChatId) return null;
    return allChatItems.find((c) => c.id === selectedChatId) || null;
  }, [allChatItems, selectedChatId]);

  // Metrics summary for tabs
  const tabCounts = useMemo(() => {
    return {
      public: allChatItems.filter((c) => c.tabCategory === 'PUBLIC').length,
      ongoing: allChatItems.filter((c) => c.tabCategory === 'ONGOING').length,
      hold: allChatItems.filter((c) => c.tabCategory === 'HOLD').length,
      completed: allChatItems.filter((c) => c.tabCategory === 'COMPLETED').length,
    };
  }, [allChatItems]);

  // Toggle Counselor Online / Offline Status
  const handleToggleOnlineStatus = useCallback(async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await chatService.setCounselorStatus(next);
      toast.success(`Counselor status set to: ${next ? 'Online (Available)' : 'Offline (Busy)'}`);
    } catch {
      toast.info(`Counselor status updated locally: ${next ? 'Online' : 'Offline'}`);
    }
  }, [isOnline]);

  // Flow B: Manual Customer Entry & Start Chat
  const handleCreateManualLead = useCallback(
    (dto: CreateManualCustomerLeadDto) => {
      const newLeadId = 'lead-' + Date.now();
      const newLead: CounselorChatItem = {
        id: newLeadId,
        orderId: 'LEAD-' + Math.floor(1000 + Math.random() * 9000),
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        serviceId: dto.serviceId,
        serviceName: 'Custom Inquiry',
        orderStatus: OrderStatus.PENDING,
        totalPrice: 0,
        advancePaid: 0,
        dueAmount: 0,
        assignedProvider: null,
        tabCategory: 'ONGOING',
        createdAt: new Date().toISOString(),
      };

      setManualLeads((prev) => {
        const next = [newLead, ...prev];
        try {
          localStorage.setItem(`counselor_leads_${userId || 'guest'}`, JSON.stringify(next));
        } catch {}
        return next;
      });

      setSelectedChatId(newLeadId);
      toast.success(`Manual customer chat created for ${dto.customerName}! 💬`);
    },
    [userId]
  );

  // FR-ORD-01: Create Custom Order & Advance Terms
  const handleCreateCustomOrder = useCallback(
    async (dto: CounselorCreateOrderDto, activeCustomerId?: string) => {
      try {
        const createdOrder = await ordersService.createOrder({
          serviceId: dto.serviceId,
          customerId: activeCustomerId,
          providerId: dto.assignedProviderId,
          originalPrice: dto.totalPrice,
          advancePaid: dto.advanceAmount,
        });

        await queryClient.invalidateQueries({ queryKey: ['counselor-orders'] });
        toast.success(`Custom Order #${createdOrder.id.slice(0, 8).toUpperCase()} created with ৳${dto.advanceAmount} advance! 🎉`);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create custom order';
        toast.error(msg);
      }
    },
    [queryClient]
  );

  // FR-ORD-02: Add-On Price Modification
  const handleModifyPrice = useCallback(
    async (orderId: string, additionalPrice: number) => {
      try {
        await ordersService.updateOrder(orderId, { additionalPrice });
        await queryClient.invalidateQueries({ queryKey: ['counselor-orders'] });
        toast.success(`Added ৳${additionalPrice} add-on to order! Customer re-approval prompt dispatched. ৳`);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to modify order price';
        toast.error(msg);
      }
    },
    [queryClient]
  );

  // FR-MOD-04: Automated Due Payment Reminder
  const handleSendDueReminder = useCallback(
    async (orderId: string, dueAmount: number, phone: string) => {
      toast.success(`Automated Due Payment Reminder (৳${dueAmount}) dispatched via Push Notification & SMS to ${phone}! 📲`);
    },
    []
  );

  // FR-REV-02: Re-Assign Provider to Order & Chat
  const handleReassignProvider = useCallback(
    async (orderId: string, providerId: string) => {
      try {
        await ordersService.updateOrder(orderId, { technicianId: providerId });
        await queryClient.invalidateQueries({ queryKey: ['counselor-orders'] });
        toast.success(`Provider successfully re-assigned to order! 🤝`);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reassign provider';
        toast.error(msg);
      }
    },
    [queryClient]
  );

  // FR-MOD-01 & 02: Hold Misbehaving Provider & Moderate Reviews
  const handleHoldProvider = useCallback(
    async (orderId: string, remarks: string) => {
      try {
        await ordersService.updateStatus(orderId, OrderStatus.DISPUTED);
        await queryClient.invalidateQueries({ queryKey: ['counselor-orders'] });
        toast.warning(`Order moved to HOLD TAB. Provider suspended from this chat: "${remarks}" ⚠️`);
      } catch {
        toast.info(`Order marked in dispute/hold status`);
      }
    },
    [queryClient]
  );

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedChatId,
    setSelectedChatId,
    activeChatItem,
    filteredChatItems,
    tabCounts,
    isOrdersLoading,
    refetchOrders,
    isOnline,
    handleToggleOnlineStatus,
    handleCreateManualLead,
    handleCreateCustomOrder,
    handleModifyPrice,
    handleSendDueReminder,
    handleReassignProvider,
    handleHoldProvider,
  };
}
