'use client';

import { useMemo, useState } from 'react';
import { useTechnicianOrders } from '@/hooks/useTechnicianOrders';
import { useOrderHistoryStore, selectOpenOrderId } from '@/store/useOrderHistoryStore';
import { User } from '@/types/auth.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';
import { OrderHistoryListItem } from '../order-history/OrderHistoryListItem';
import { CustomerAvatar } from '../provider/CustomerAvatar';
import { PROVIDER_FILTER_CHIPS, matchesProviderFilter, providerOrderTitle } from '../provider/provider-order-filters';
import { MyRatingButton } from '../reviews/MyRatingButton';
import { SupportChatRow } from '../support/SupportChatRow';

interface TechnicianOrdersSidebarProps {
  user: User;
  onOrderOpened: () => void;
  onOpenAuth: () => void;
  /** Opens the pinned Support chat. */
  onOpenSupport: () => void;
  isSupportOpen: boolean;
}

/*
 * The technician's landing list: only the orders their provider put them on. There is no service catalog, no
 * other customers and no other providers here; the backend sends nothing else, and this list shows nothing else.
 */
export function TechnicianOrdersSidebar({ user, onOrderOpened, onOpenAuth, onOpenSupport, isSupportOpen }: TechnicianOrdersSidebarProps) {
  const { data: orders = [], isLoading } = useTechnicianOrders(user.id);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(user.id));
  const selectOrder = useOrderHistoryStore((state) => state.select);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('All');

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders
      .filter((order) => matchesProviderFilter(order, activeFilterChip))
      .filter((order) => {
        if (!query) return true;
        const customer = order.customer?.user;
        return `${order.referenceCode} ${customer?.name ?? ''} ${order.service?.name ?? ''}`.toLowerCase().includes(query);
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
        searchPlaceholder="Search my jobs..."
        profileSlot={
          <div className="flex items-center gap-[10px]">
            {user.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
              <img src={user.profilePhoto} alt="" className="size-[44px] shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-[#d7fdd2] text-[18px] font-semibold text-[#205737]">{(user.name || '?').charAt(0).toUpperCase()}</span>
            )}
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-[8px]">
                <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{user.name || 'My account'}</span>
                {/* Opens "আমার রিভিউ": what customers said about the jobs this technician did. */}
                <MyRatingButton userId={user.id} role="TECHNICIAN" />
              </div>
              {/* Their own number: the backend sends a person their own phone, and nobody else's. */}
              <span className="truncate text-[13px] font-medium text-[#697586]">{user.mobileNumber}</span>
              <span className="w-fit rounded-full bg-[#202939] px-[8px] py-[1px] text-[11px] font-semibold text-white">Technician</span>
            </div>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[8px] pb-[8px]">
        <div className="pt-[8px]">
          <SupportChatRow userId={user.id} isActive={isSupportOpen} onOpen={onOpenSupport} />
        </div>
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-[#697586]">Loading your jobs...</p>}
        {!isLoading && visibleOrders.length === 0 && (
          <p className="p-[24px] text-center text-[14px] font-medium text-[#697586]">{orders.length === 0 ? 'No jobs yet. Your provider will assign orders to you.' : 'No jobs match.'}</p>
        )}
        {visibleOrders.map((order) => (
          <OrderHistoryListItem
            key={order.id}
            order={order}
            isSelected={!isSupportOpen && order.id === openOrderId}
            onSelect={(selected) => {
              selectOrder(user.id, selected.id);
              onOrderOpened();
            }}
            title={providerOrderTitle(order)}
            avatar={<CustomerAvatar order={order} />}
          />
        ))}
      </div>
    </>
  );
}
