'use client';

import { useMemo, useState } from 'react';
import { useMyOrders } from '@/hooks/useMyOrders';
import { selectOpenOrderId, useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { Order } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';
import { buildOrderTabLabel } from '../order-chat/order-labels';
import { OrderHistoryListItem } from './OrderHistoryListItem';
import { ORDER_FILTER_CHIPS, matchesOrderFilter } from './order-status';

interface CustomerOrdersSidebarProps {
  user: User;
  onStartNewOrder: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  /** Phones show the list and the chat one at a time. */
  onOrderOpened: () => void;
}

/*
 * The Orders view of the sidebar: the same profile header, + button, search and chips as the
 * services list, but the rows are the customer's own orders, newest first, filtered by status.
 */
export function CustomerOrdersSidebar({ user, onStartNewOrder, onOpenAuth, onOpenProfile, onOrderOpened }: CustomerOrdersSidebarProps) {
  const { data: orders = [], isLoading } = useMyOrders(user.id);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(user.id));
  const selectOrder = useOrderHistoryStore((state) => state.select);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('All');

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders
      .filter((order) => matchesOrderFilter(order.orderStatus, activeFilterChip))
      .filter((order) => !query || `${buildOrderTabLabel(order)} ${order.service?.name ?? ''} ${order.service?.category?.name ?? ''}`.toLowerCase().includes(query))
      .sort((newer, older) => older.createdAt.localeCompare(newer.createdAt));
  }, [orders, searchQuery, activeFilterChip]);

  const handleSelect = (order: Order) => {
    selectOrder(user.id, order.id);
    onOrderOpened();
  };

  return (
    <>
      <CustomerSidebarTop
        isAuthenticated
        user={user}
        onStartNewOrder={onStartNewOrder}
        onOpenAuth={onOpenAuth}
        onOpenAccount={onOpenProfile}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => {}}
        onSearchBlur={() => {}}
        activeFilterChip={activeFilterChip}
        onSelectFilterChip={setActiveFilterChip}
        categoryNames={[...ORDER_FILTER_CHIPS]}
        isSearchCollapsed={false}
        searchPlaceholder="Search orders..."
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[8px] pb-[8px]">
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">Loading orders...</p>}
        {!isLoading && visibleOrders.length === 0 && (
          <p className="p-[24px] text-center text-[14px] font-medium text-muted">
            {orders.length === 0 ? 'You have not placed any order yet.' : 'No orders match.'}
          </p>
        )}
        {visibleOrders.map((order) => (
          <OrderHistoryListItem key={order.id} order={order} isSelected={order.id === openOrderId} onSelect={handleSelect} />
        ))}
      </div>
    </>
  );
}
