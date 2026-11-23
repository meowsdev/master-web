'use client';

import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { selectOpenOrderId, useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { User } from '@/types/auth.types';
import { Order } from '@/types/order.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';
import { OrderHistoryListItem } from '../order-history/OrderHistoryListItem';
import { CustomerAvatar } from '../provider/CustomerAvatar';
import { PROVIDER_FILTER_CHIPS, hasOpenRevision, matchesProviderFilter, providerOrderTitle } from '../provider/provider-order-filters';
import { StaffSidebarHeader } from './AdminProfileHeader';

/** Every order on the platform, newest first. The backend returns all of them for an admin. */
export function useAdminOrders(userId: string | undefined) {
  return useQuery<Order[]>({
    queryKey: ['admin-orders', userId],
    queryFn: () => ordersService.getOrders(),
    enabled: Boolean(userId),
    refetchInterval: 5000,
  });
}

/*
 * The admin's landing list: the same search, status chips and rows as the provider's, but over every
 * order on the platform. The row names the order and the customer; the line under it names the provider.
 */
export function AdminOrdersSidebar({ user, onOrderOpened, onOpenAuth }: { user: User; onOrderOpened: () => void; onOpenAuth: () => void }) {
  const { data: orders = [], isLoading } = useAdminOrders(user.id);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(user.id));
  const selectOrder = useOrderHistoryStore((state) => state.select);
  const openPanel = useOrderPanelStore((state) => state.open);
  const { canCreateOrders } = useStaffPermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('All');

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders
      .filter((order) => matchesProviderFilter(order, activeFilterChip))
      .filter((order) => {
        if (!query) return true;
        const customer = order.customer?.user;
        // A pending order has no provider yet, only a stand-in, so it is not searchable by one.
        const provider = order.isAccepted ? order.provider?.user : undefined;
        const haystack = `${order.referenceCode} ${customer?.name ?? ''} ${customer?.username ?? ''} ${provider?.name ?? ''} ${provider?.username ?? ''} ${order.isAccepted ? order.provider?.companyName ?? '' : ''} ${order.service?.name ?? ''}`;
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
        searchPlaceholder="Search all orders..."
        profileSlot={<StaffSidebarHeader user={user} action={canCreateOrders ? { label: 'New order', onClick: () => openPanel(null, 'adminOrder') } : undefined} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[8px]">
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">Loading orders...</p>}
        {!isLoading && visibleOrders.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-muted">{orders.length === 0 ? 'No orders yet.' : 'No orders match.'}</p>}
        {visibleOrders.map((order) => (
          <OrderHistoryListItem
            key={order.id}
            order={order}
            isSelected={order.id === openOrderId}
            onSelect={(selected) => {
              selectOrder(user.id, selected.id);
              onOrderOpened();
            }}
            title={providerOrderTitle(order)}
            avatar={<CustomerAvatar order={order} />}
            statusOverride={order.needsAttention ? { text: 'Needs provider', className: 'text-[#d64545]' } : hasOpenRevision(order) ? { text: 'Revision', className: 'text-[#b7791f]' } : order.hasPendingExpenseClaim ? { text: 'খরচ রিভিউ', className: 'text-[#b7791f]' } : undefined}
          />
        ))}
      </div>
    </>
  );
}
