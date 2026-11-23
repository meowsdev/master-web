'use client';

import { useMemo, useState } from 'react';
import { Order } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';
import { OrderHistoryListItem } from '../order-history/OrderHistoryListItem';
import { SupportChatRow } from '../support/SupportChatRow';
import { CustomerAvatar } from './CustomerAvatar';
import { ProviderProfileHeader } from './ProviderProfileHeader';
import { PROVIDER_FILTER_CHIPS, hasOpenRevision, matchesProviderFilter, providerOrderTitle } from './provider-order-filters';

interface ProviderOrdersSidebarProps {
  user: User;
  orders: Order[];
  isLoading: boolean;
  activeOrderId: string | null;
  onSelectOrder: (order: Order) => void;
  onOpenAuth: () => void;
  /** Opens the pinned Support chat. */
  onOpenSupport: () => void;
  isSupportOpen: boolean;
}

/*
 * The provider's landing list: their profile with the due and Pay Now, search, status chips and
 * one row per order (id and customer). Same top section and rows as the customer's list.
 */
export function ProviderOrdersSidebar({ user, orders, isLoading, activeOrderId, onSelectOrder, onOpenAuth, onOpenSupport, isSupportOpen }: ProviderOrdersSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('All');

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders
      .filter((order) => matchesProviderFilter(order, activeFilterChip))
      .filter((order) => {
        if (!query) return true;
        const customer = order.customer?.user;
        const haystack = `${order.referenceCode} ${customer?.name ?? ''} ${customer?.username ?? ''} ${order.service?.name ?? ''} ${order.service?.category?.name ?? ''}`;
        return haystack.toLowerCase().includes(query);
      })
      .sort((newer, older) => older.createdAt.localeCompare(newer.createdAt));
  }, [orders, searchQuery, activeFilterChip]);

  return (
    <>
      <CustomerSidebarTop
        isAuthenticated
        user={user}
        onOpenAuth={onOpenAuth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => {}}
        onSearchBlur={() => {}}
        activeFilterChip={activeFilterChip}
        onSelectFilterChip={setActiveFilterChip}
        categoryNames={[...PROVIDER_FILTER_CHIPS]}
        isSearchCollapsed={false}
        searchPlaceholder="Search orders..."
        profileSlot={<ProviderProfileHeader user={user} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[8px]">
        <div className="pt-[8px]">
          <SupportChatRow userId={user.id} isActive={isSupportOpen} onOpen={onOpenSupport} />
        </div>
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">Loading orders...</p>}
        {!isLoading && visibleOrders.length === 0 && (
          <p className="p-[24px] text-center text-[14px] font-medium text-muted">{orders.length === 0 ? 'No orders yet.' : 'No orders match.'}</p>
        )}
        {visibleOrders.map((order) => (
          <OrderHistoryListItem
            key={order.id}
            order={order}
            isSelected={order.id === activeOrderId}
            onSelect={onSelectOrder}
            title={providerOrderTitle(order)}
            avatar={<CustomerAvatar order={order} />}
            statusOverride={hasOpenRevision(order) ? { text: 'Revision', className: 'text-[#b7791f]' } : undefined}
          />
        ))}
      </div>
    </>
  );
}
