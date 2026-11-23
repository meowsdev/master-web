'use client';

import React, { useState } from 'react';
import { SupportDirectorySidebar } from './support/SupportDirectorySidebar';
import { supportRoleForTab } from './support/support-tabs';
import { TechnicianOrdersSidebar } from './technician/TechnicianOrdersSidebar';
import { ProviderOrdersSidebar } from './provider/ProviderOrdersSidebar';
import { AdminOrdersSidebar } from './admin/AdminOrdersSidebar';
import { AdminServicesSidebar } from './admin/AdminServicesSidebar';
import { StaffSidebar } from './admin/staff/StaffSidebar';
import { ServiceList } from './ServiceList';
import { CustomerSidebarTop } from './CustomerSidebarTop';
import { CustomerOrdersSidebar } from './order-history/CustomerOrdersSidebar';
import { RailTab, ChatMessage } from '@/types/super-app.types';
import { Order } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { Service } from '@/types/service.types';
import { ChatSession } from '@/types/chat.types';
import { isStaffRole } from '@/lib/roles';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';

interface SuperAppSidebarProps {
  activeRailTab: RailTab;
  mobileView: 'LIST' | 'CHAT';
  setMobileView: (view: 'LIST' | 'CHAT') => void;
  isDarkMode: boolean;
  onOpenOrders: () => void;
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  isAuthenticated: boolean;
  isProvider: boolean;
  user: User | null;
  activeRole: string | null;
  // Provider
  providerOrders: Order[];
  isProviderOrdersLoading: boolean;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  /** Opens the pinned Support chat, and whether it is the chat on screen. */
  onOpenSupport: () => void;
  /** Closes the Support chat when another chat is picked. */
  onLeaveSupport: () => void;
  isSupportOpen: boolean;
  onOpenProfile: () => void;
  onStartNewOrder: () => void;
  // Customer / guest
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setIsSearchFocused: (f: boolean) => void;
  activeFilterChip: string;
  setActiveFilterChip: (c: string) => void;
  runningServiceIds: string[];
  filteredServices: Service[];
  categoryNames: string[];
  allDbServicesCount: number;
  isServicesLoading: boolean;
  activeServiceId: string | null;
  onSelectService: (s: Service) => void;
  serviceMessages: Record<string, ChatMessage[]>;
  conversationByServiceId?: Map<string, ChatSession>;
}

/* The left list. Same WhatsApp-style shell for everyone; which list fills it depends on the role and, for staff, on their permissions. */
export function SuperAppSidebar({
  activeRailTab,
  mobileView,
  setMobileView,
  isDarkMode,
  onOpenOrders,
  onOpenAuth,
  isAuthenticated,
  isProvider,
  user,
  activeRole,
  providerOrders,
  isProviderOrdersLoading,
  activeOrderId,
  setActiveOrderId,
  onOpenSupport,
  onLeaveSupport,
  isSupportOpen,
  onOpenProfile,
  onStartNewOrder,
  searchQuery,
  setSearchQuery,
  setIsSearchFocused,
  activeFilterChip,
  setActiveFilterChip,
  runningServiceIds,
  filteredServices,
  categoryNames,
  allDbServicesCount,
  isServicesLoading,
  activeServiceId,
  onSelectService,
  serviceMessages,
  conversationByServiceId,
}: SuperAppSidebarProps) {
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const isStaff = isStaffRole(activeRole);
  const isTechnician = activeRole === 'TECHNICIAN';
  const { canManageServices, canChatWithMembers, canManageStaff } = useStaffPermissions();
  const memberChatRole = canChatWithMembers ? supportRoleForTab(activeRailTab) : null;
  const bgSidebar = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-line';
  const openAuth = () => onOpenAuth('LOGIN');

  return (
    <section
      className={`${
        mobileView === 'LIST' ? 'flex' : 'hidden md:flex'
      } flex-col w-full md:w-[380px] lg:w-[420px] border-r shrink-0 h-full relative z-10 ${bgSidebar}`}
      style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
    >
      {isStaff && user && memberChatRole ? (
        /* Staff: direct chat with providers, technicians or customers */
        <SupportDirectorySidebar user={user} role={memberChatRole} onMemberOpened={() => setMobileView('CHAT')} onOpenAuth={openAuth} />
      ) : isStaff && user && canManageStaff && activeRailTab === 'STAFF' ? (
        /* Admin: office staff accounts */
        <StaffSidebar user={user} onStaffOpened={() => setMobileView('CHAT')} onOpenAuth={openAuth} />
      ) : isStaff && user && canManageServices && activeRailTab === 'SERVICES' ? (
        <AdminServicesSidebar user={user} onServiceOpened={() => setMobileView('CHAT')} onOpenAuth={openAuth} />
      ) : isStaff && user ? (
        /* Staff: every order on the platform */
        <AdminOrdersSidebar user={user} onOrderOpened={() => setMobileView('CHAT')} onOpenAuth={openAuth} />
      ) : isTechnician && user ? (
        /* Technician: only the jobs their provider put them on */
        <TechnicianOrdersSidebar user={user} onOrderOpened={() => { onLeaveSupport(); setMobileView('CHAT'); }} onOpenAuth={openAuth} onOpenSupport={onOpenSupport} isSupportOpen={isSupportOpen} />
      ) : isProvider && user ? (
        /* Provider: profile with due + Pay Now, search, chips, one row per order */
        <ProviderOrdersSidebar
          user={user}
          orders={providerOrders}
          isLoading={isProviderOrdersLoading}
          activeOrderId={activeOrderId}
          onSelectOrder={(order) => {
            setActiveOrderId(order.id);
            setMobileView('CHAT');
          }}
          onOpenAuth={openAuth}
          onOpenSupport={onOpenSupport}
          isSupportOpen={isSupportOpen}
        />
      ) : activeRailTab === 'ORDERS' && isAuthenticated && user ? (
        /* Customer: the Orders rail icon swaps the services list for their own orders */
        <CustomerOrdersSidebar user={user} onStartNewOrder={onStartNewOrder} onOpenAuth={openAuth} onOpenProfile={onOpenProfile} onOrderOpened={() => setMobileView('CHAT')} />
      ) : (
        /* Customer / guest: the services catalog */
        <>
          <CustomerSidebarTop
            isAuthenticated={isAuthenticated}
            user={user}
            onStartNewOrder={onStartNewOrder}
            onOpenAuth={openAuth}
            onOpenOrders={onOpenOrders}
            onOpenAccount={onOpenProfile}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
            activeFilterChip={activeFilterChip}
            onSelectFilterChip={setActiveFilterChip}
            categoryNames={categoryNames}
            isSearchCollapsed={isSearchCollapsed}
          />

          <ServiceList
            services={filteredServices}
            allDbServicesCount={allDbServicesCount}
            isLoading={isServicesLoading}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            activeServiceId={activeServiceId}
            onSelectService={onSelectService}
            isAuthenticated={isAuthenticated}
            user={user}
            activeRole={activeRole}
            onOpenAuth={openAuth}
            onOpenProfile={onOpenProfile}
            runningServiceIds={runningServiceIds}
            serviceMessages={serviceMessages}
            conversationByServiceId={conversationByServiceId}
            activeFilterChip={activeFilterChip}
            onScrollIntent={(intent) => setIsSearchCollapsed(intent === 'collapse')}
            isDarkMode={isDarkMode}
            onOpenSupport={onOpenSupport}
            isSupportOpen={isSupportOpen}
          />
        </>
      )}
    </section>
  );
}
