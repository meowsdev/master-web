'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { LogIn } from 'lucide-react';
import { Service } from '@/types/service.types';
import { ChatMessage } from '@/types/super-app.types';
import { User } from '@/types/auth.types';
import { Order } from '@/types/order.types';
import { ordersService } from '@/services/orders.service';
import { ServiceListItem } from './ServiceListItem';

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
  activeFilterChip?: string;
  isDarkMode: boolean;
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
  onOpenAuth,
  onOpenProfile,
  runningServiceIds = [],
  serviceMessages = {},
  activeFilterChip,
  isDarkMode,
}: ServiceListProps) {
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  // Fetch customer orders (shares 'my-orders-drawer' cache) to detect running revisions
  const { data: customerOrders = [] } = useQuery<Order[]>({
    queryKey: ['my-orders-drawer', user?.id],
    queryFn: () => ordersService.getOrders(),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 10000,
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
      <div className="flex-1 overflow-y-auto">
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
              {activeFilterChip === 'Running'
                ? 'No running orders right now'
                : searchQuery
                ? `No services found matching "${searchQuery}"`
                : 'No services in this list yet'}
            </p>
            <p className={`text-xs ${textSecondary}`}>
              {activeFilterChip === 'Running'
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
                  (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
                )
            );
            const dbActiveRevision = dbOrderWithRev?.revisions?.find(
              (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
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
                onSelect={onSelectService}
                isDarkMode={isDarkMode}
              />
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div
        className={`p-3 border-t flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-[#182229] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]'
        }`}
      >
        {isAuthenticated ? (
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition-opacity"
            title="Click to view & edit Profile"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#008069] text-white flex items-center justify-center text-xs font-bold shrink-0 border border-[#25D366]">
              {user?.profilePhoto ? (
                <Image src={user.profilePhoto} alt="User" width={32} height={32} unoptimized className="object-cover w-full h-full" />
              ) : (
                <span>{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${textPrimary} group-hover:text-[#008069] dark:group-hover:text-[#25D366] transition-colors`}>
                {user?.name}
              </p>
              <p className="text-[11px] text-[#25D366] font-bold">{activeRole || 'CUSTOMER'}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs ${textSecondary}`}>Guest Customer</span>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-[#25D366]/25"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
