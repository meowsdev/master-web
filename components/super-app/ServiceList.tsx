'use client';

import React, { useMemo, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Service } from '@/types/service.types';
import { ChatMessage } from '@/types/super-app.types';
import { User } from '@/types/auth.types';
import { Order } from '@/types/order.types';
import { ChatSession } from '@/types/chat.types';
import { ordersService } from '@/services/orders.service';
import { ServiceListItem } from './ServiceListItem';
import { SupportChatRow } from './support/SupportChatRow';

interface ServiceListProps {
  services: Service[];
  allDbServicesCount: number;
  isLoading: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  activeServiceId: string | null;
  onSelectService: (service: Service) => void;
  isAuthenticated: boolean;
  user: User | null;
  activeRole: string | null;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  runningServiceIds?: string[];
  serviceMessages?: Record<string, ChatMessage[]>;
  conversationByServiceId?: Map<string, ChatSession>;
  activeFilterChip?: string;
  /** Fired while scrolling so the parent can collapse/restore the search area. */
  onScrollIntent?: (intent: 'collapse' | 'expand') => void;
  isDarkMode: boolean;
  /** Signed-in (non-admin) users: opens the pinned Support chat. */
  onOpenSupport?: () => void;
  isSupportOpen?: boolean;
}

export function ServiceList({
  services,
  allDbServicesCount,
  isLoading,
  searchQuery,
  onClearSearch,
  activeServiceId,
  onSelectService,
  isAuthenticated,
  user,
  activeRole,
  onOpenProfile,
  runningServiceIds = [],
  serviceMessages = {},
  conversationByServiceId,
  activeFilterChip,
  onScrollIntent,
  isDarkMode,
  onOpenSupport,
  isSupportOpen = false,
}: ServiceListProps) {
  const lastScrollTopRef = useRef(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!onScrollIntent) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const delta = scrollTop - lastScrollTopRef.current;
    lastScrollTopRef.current = scrollTop;

    if (scrollTop <= 4 || delta < -6) return onScrollIntent('expand');
    // Collapsing frees ~130px; skip short lists so the layout shift can't push the scroll back to the top and re-expand in a loop.
    const hasRoomToCollapse = scrollHeight - clientHeight > 200;
    if (delta > 6 && hasRoomToCollapse) onScrollIntent('collapse');
  };
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  // Fetch customer orders (shares 'my-orders-drawer' cache) to detect running revisions
  const { data: customerOrders = [], refetch } = useQuery<Order[]>({
    queryKey: ['my-orders-drawer', user?.id],
    queryFn: () => ordersService.getOrders(),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 0, // Ensure we fetch fresh data often
  });

  // Sort services so that any service with an active revision floats to the very top
  const displayServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const aRev =
        Boolean(
          (serviceMessages[a.id] || []).some(
            (m) => m.type === 'order_card' && m.orderCard?.hasActiveRevision
          )
        ) ||
        customerOrders.some(
          (o) =>
            o.serviceId === a.id &&
            o.revisions?.some(
              (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
            )
        );
      const bRev =
        Boolean(
          (serviceMessages[b.id] || []).some(
            (m) => m.type === 'order_card' && m.orderCard?.hasActiveRevision
          )
        ) ||
        customerOrders.some(
          (o) =>
            o.serviceId === b.id &&
            o.revisions?.some(
              (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
            )
        );
      if (aRev && !bRev) return -1;
      if (!aRev && bRev) return 1;
      return 0;
    });
  }, [services, customerOrders, serviceMessages]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {isAuthenticated && user && onOpenSupport && (
          <div className="px-[8px] pt-[8px]">
            <SupportChatRow userId={user.id} isActive={isSupportOpen} onOpen={onOpenSupport} />
          </div>
        )}
        {isLoading ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-xs ${textSecondary}`}>Loading services from database...</p>
          </div>
        ) : allDbServicesCount === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className={`text-sm ${textPrimary}`}>No services found in database.</p>
            <p className={`text-xs ${textSecondary}`}>Add services in database to display them here.</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className={`text-sm font-medium ${textPrimary}`}>
              {activeFilterChip === 'Unread'
                ? 'No unread chats'
                : activeFilterChip === 'Running'
                ? 'No running orders right now'
                : searchQuery
                ? `No services found matching "${searchQuery}"`
                : 'No services in this list yet'}
            </p>
            <p className={`text-xs ${textSecondary}`}>
              {activeFilterChip === 'Unread'
                ? 'All incoming messages have been read. New unread messages will appear here.'
                : activeFilterChip === 'Running'
                ? 'When you start a service order, it will appear here in running status.'
                : searchQuery
                ? 'Try searching with different keywords'
                : 'Save services or add them when creating custom lists to view them here'}
            </p>
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#005c4b] text-white hover:bg-[#25D366]'
                    : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
                }`}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          displayServices.map((service) => {
            const msgs = serviceMessages[service.id] || [];
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

            // In-chat order card check
            const inChatOrderCard = msgs
              .slice()
              .reverse()
              .find((m) => m.type === 'order_card' && m.orderCard)?.orderCard;

            // DB order revision check
            const dbOrderWithRev = customerOrders.find(
              (o) =>
                o.serviceId === service.id &&
                o.revisions?.some(
                  (r) => r.revisionStatus !== 'COMPLETED' // Only check for non-completed revisions
                )
            );
            const dbActiveRevision = dbOrderWithRev?.revisions?.find(
              (r) => r.revisionStatus !== 'COMPLETED'
            );

            const hasActiveRevision =
              Boolean(inChatOrderCard?.hasActiveRevision) || Boolean(dbActiveRevision);

            const revisionIssue =
              inChatOrderCard?.revisionIssue ||
              dbActiveRevision?.issueDescription ||
              undefined;

            // Active running order check
            const activeDbRunningOrder = customerOrders.find(
              (o) =>
                o.serviceId === service.id &&
                ['ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'CONFIRMED'].includes(o.orderStatus)
            );

            const isRunning =
              hasActiveRevision ||
              runningServiceIds.includes(service.id) ||
              Boolean(activeDbRunningOrder);

            const runningOrderId =
              (hasActiveRevision && (dbOrderWithRev?.id ? dbOrderWithRev.id.slice(0, 8).toUpperCase() : inChatOrderCard?.orderId)) ||
              inChatOrderCard?.orderId ||
              (activeDbRunningOrder?.id ? activeDbRunningOrder.id.slice(0, 8).toUpperCase() : null);

            const conv = conversationByServiceId?.get(service.id);
            const unreadCount = conv?.unreadCount ?? 0;

            return (
              <ServiceListItem
                key={service.id}
                service={service}
                isSelected={service.id === activeServiceId}
                isRunning={isRunning}
                runningOrderId={runningOrderId}
                hasActiveRevision={hasActiveRevision}
                revisionIssue={revisionIssue}
                lastMessage={lastMsg}
                unreadCount={unreadCount}
                onSelect={onSelectService}
                isDarkMode={isDarkMode}
              />
            );
          })
        )}
      </div>

      {/* Signed-in profile footer; guests log in through the header's "Join Now" */}
      {/* {isAuthenticated && (
        <div className="p-3 border-t flex items-center shrink-0 bg-[#f7f5f3] border-[#e5e5e5]">
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition-opacity"
            title="Click to view & edit Profile"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1daa61] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.profilePhoto ? (
                <Image src={user.profilePhoto} alt="User" width={32} height={32} unoptimized className="object-cover w-full h-full" />
              ) : (
                <span>{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${textPrimary}`}>{user?.name}</p>
              <p className="text-[11px] text-[#1daa61] font-bold">{activeRole || 'CUSTOMER'}</p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
