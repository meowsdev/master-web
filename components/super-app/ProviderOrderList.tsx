'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Search, X, RotateCcw, PackageCheck, Briefcase, Wrench } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { ProviderOrderListItem } from './ProviderOrderListItem';

export type ProviderOrderFilter = 'ALL' | 'REVISION' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface ProviderOrderListProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
  activeOrderId: string | null;
  onSelectOrder: (order: Order) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: ProviderOrderFilter;
  onSelectFilter: (filter: ProviderOrderFilter) => void;
  user: User | null;
  onOpenProfile: () => void;
  onOpenSkillsModal: () => void;
  isDarkMode: boolean;
}

export function ProviderOrderList({
  orders,
  isLoading,
  onRefresh,
  activeOrderId,
  onSelectOrder,
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  user,
  onOpenProfile,
  onOpenSkillsModal,
  isDarkMode,
}: ProviderOrderListProps) {
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgSearch = isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';

  // Helper to determine if an order has an active customer revision
  const hasActiveRevision = (order: Order) =>
    order.revisions?.some(
      (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
    );

  // Compute filtered orders
  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    if (activeFilter === 'REVISION' && !hasActiveRevision(order)) return false;
    if (activeFilter === 'PENDING' && order.orderStatus !== OrderStatus.PENDING) return false;
    if (activeFilter === 'IN_PROGRESS' && order.orderStatus !== OrderStatus.IN_PROGRESS && order.orderStatus !== OrderStatus.ACCEPTED) return false;
    if (activeFilter === 'COMPLETED' && order.orderStatus !== OrderStatus.COMPLETED) return false;

    // 2. Search Query Filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const serviceName = order.service?.name?.toLowerCase() || '';
    const customerName = order.customer?.user?.name?.toLowerCase() || '';
    const orderId = order.id.toLowerCase();
    return serviceName.includes(q) || customerName.includes(q) || orderId.includes(q);
  });

  // Highest Priority Sorting: Orders with active revisions appear at the very top!
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const aRev = hasActiveRevision(a) ? 1 : 0;
      const bRev = hasActiveRevision(b) ? 1 : 0;
      if (aRev !== bRev) return bRev - aRev; // Active revision gets absolute highest priority
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredOrders]);

  const revisionCount = orders.filter(hasActiveRevision).length;

  const filterChips: { id: ProviderOrderFilter; label: string; count?: number; isUrgent?: boolean }[] = [
    { id: 'ALL', label: 'All Jobs', count: orders.length },
    ...(revisionCount > 0
      ? [
          {
            id: 'REVISION' as ProviderOrderFilter,
            label: '⚠️ Revision',
            count: revisionCount,
            isUrgent: true,
          },
        ]
      : []),
    {
      id: 'PENDING',
      label: 'Pending',
      count: orders.filter((o) => o.orderStatus === OrderStatus.PENDING).length,
    },
    {
      id: 'IN_PROGRESS',
      label: 'Running',
      count: orders.filter((o) => o.orderStatus === OrderStatus.IN_PROGRESS || o.orderStatus === OrderStatus.ACCEPTED).length,
    },
    {
      id: 'COMPLETED',
      label: 'Completed',
      count: orders.filter((o) => o.orderStatus === OrderStatus.COMPLETED).length,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Search Bar & Filters Section */}
      <div className={`p-2 border-b space-y-2 shrink-0 ${isDarkMode ? 'border-[#222e35]' : 'border-[#e9edef]'}`}>
        {/* Search input pill & Skills button */}
        <div className="flex items-center gap-2">
          <div className={`flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-lg ${bgSearch}`}>
            <Search className={`w-4 h-4 shrink-0 ${textSecondary}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search assigned orders..."
              className={`w-full bg-transparent text-sm focus:outline-none ${textPrimary} placeholder:${textSecondary}`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className={`p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textSecondary}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onOpenSkillsModal}
            className="px-2.5 py-2 rounded-lg bg-[#008069]/10 hover:bg-[#008069]/20 text-[#008069] dark:text-[#25D366] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            title="Configure service skills you provide"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Skills</span>
          </button>
        </div>


        {/* WhatsApp Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onSelectFilter(chip.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  chip.isUrgent
                    ? isActive
                      ? 'bg-amber-400 text-black font-black shadow-xs ring-1 ring-amber-500'
                      : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 font-bold'
                    : isActive
                    ? isDarkMode
                      ? 'bg-[#00a884] text-[#111b21]'
                      : 'bg-[#d9fdd3] text-[#008069]'
                    : isDarkMode
                    ? 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
                    : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'
                }`}
              >
                <span>{chip.label}</span>
                {chip.count !== undefined && chip.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      chip.isUrgent
                        ? 'bg-amber-500 text-black font-black'
                        : isActive
                        ? 'bg-black/15 text-inherit'
                        : 'bg-black/5 dark:bg-white/10 text-inherit'
                    }`}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Scrollable List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-xs ${textSecondary}`}>Loading your assigned orders...</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-[#25D366] flex items-center justify-center mx-auto">
              <PackageCheck className="w-7 h-7" />
            </div>
            <h4 className={`text-sm font-bold ${textPrimary}`}>
              {searchQuery ? 'No matching orders' : 'No assigned orders found'}
            </h4>
            <p className={`text-xs max-w-xs mx-auto leading-relaxed ${textSecondary}`}>
              {searchQuery
                ? 'Try searching with a different customer name or order ID.'
                : 'Customer service bookings dispatched to your agency will appear here in real-time.'}
            </p>
            <button
              onClick={onRefresh}
              className="px-3.5 py-1.5 rounded-xl bg-[#008069]/10 text-[#008069] dark:text-[#25D366] text-xs font-bold transition-all hover:bg-[#008069]/20 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>
        ) : (
          sortedOrders.map((order) => (
            <ProviderOrderListItem
              key={order.id}
              order={order}
              isSelected={activeOrderId === order.id}
              onSelect={onSelectOrder}
              isDarkMode={isDarkMode}
            />
          ))
        )}
      </div>

      {/* Provider Footer Bar */}
      <div
        className={`p-3 border-t flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-[#182229] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]'
        }`}
      >
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition-opacity"
          title="Provider Profile Settings"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#008069] text-white flex items-center justify-center text-xs font-bold shrink-0 border border-[#25D366]">
            {user?.profilePhoto ? (
              <Image src={user.profilePhoto} alt="Provider" width={32} height={32} unoptimized className="object-cover w-full h-full" />
            ) : (
              <span>{user?.name ? user.name[0].toUpperCase() : 'P'}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-bold truncate ${textPrimary} group-hover:text-[#008069] dark:group-hover:text-[#25D366] transition-colors`}>
              {user?.name || 'Verified Provider'}
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              <p className="text-[10px] text-[#25D366] font-bold uppercase tracking-wider">
                Assigned Orders ({orders.length})
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} transition-colors cursor-pointer`}
          title="Refresh assigned orders"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
