'use client';

import React, { useState } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SupportDirectorySidebar } from './support/SupportDirectorySidebar';
import { ProviderOrderFilter } from './ProviderOrderList';
import { ProviderOrdersSidebar } from './provider/ProviderOrdersSidebar';
import { AdminOrdersSidebar } from './admin/AdminOrdersSidebar';
import { AdminServicesSidebar } from './admin/AdminServicesSidebar';
import { CounselorChatList } from './CounselorChatList';
import { ServiceList } from './ServiceList';
import { CustomerSidebarTop } from './CustomerSidebarTop';
import { CustomerOrdersSidebar } from './order-history/CustomerOrdersSidebar';
import { RailTab } from '@/types/super-app.types';
import { Order } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { Service } from '@/types/service.types';
import { ChatSession } from '@/types/chat.types';
import { ChatMessage, CustomFilterList } from '@/types/super-app.types';
import { CounselorTab, CounselorChatItem } from '@/types/counselor.types';

interface SuperAppSidebarProps {
  activeRailTab: RailTab;
  mobileView: 'LIST' | 'CHAT';
  setMobileView: (view: 'LIST' | 'CHAT') => void;
  isDarkMode: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  runningCount: number;
  onSelectWelcome: () => void;
  onOpenSettings: () => void;
  onOpenOrders: () => void;
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  isAuthenticated: boolean;
  userName?: string | null;
  onLogout: () => void;
  // Roles
  isProvider: boolean;
  isCounselor: boolean;
  user: User | null;
  activeRole: string | null;
  // Provider props
  providerOrders: Order[];
  isProviderOrdersLoading: boolean;
  refetchProviderOrders: () => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  /** Opens the pinned Support chat, and whether it is the chat on screen. */
  onOpenSupport: () => void;
  isSupportOpen: boolean;
  providerSearchQuery: string;
  setProviderSearchQuery: (q: string) => void;
  providerActiveFilter: ProviderOrderFilter;
  setProviderActiveFilter: (f: ProviderOrderFilter) => void;
  onOpenProfile: () => void;
  onStartNewOrder: () => void;
  onOpenSkillsModal: () => void;
  onOpenTeamManagement: () => void;
  onOpenLeveling: () => void;
  onOpenStartChat: () => void;
  // Counselor props
  counselorChatItems: CounselorChatItem[];
  isCounselorOrdersLoading: boolean;
  counselorActiveTab: CounselorTab;
  setCounselorActiveTab: (tab: CounselorTab) => void;
  counselorSearchQuery: string;
  setCounselorSearchQuery: (q: string) => void;
  counselorSelectedChatId: string | null;
  onSelectCounselorChat: (item: CounselorChatItem) => void;
  counselorTabCounts: { public: number; ongoing: number; hold: number; completed: number };
  isCounselorOnline: boolean;
  onToggleCounselorOnline: () => void;
  onOpenAddCustomer: () => void;
  // Customer props
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (f: boolean) => void;
  activeFilterChip: string;
  setActiveFilterChip: (c: string) => void;
  customFilters: CustomFilterList[];
  onOpenCreateFilter: () => void;
  onDeleteCustomFilter: (f: string) => void;
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

export function SuperAppSidebar({
  activeRailTab,
  mobileView,
  setMobileView,
  isDarkMode,
  soundEnabled,
  onToggleSound,
  runningCount,
  onSelectWelcome,
  onOpenSettings,
  onOpenOrders,
  onOpenAuth,
  isAuthenticated,
  userName,
  onLogout,
  isProvider,
  isCounselor,
  user,
  activeRole,
  providerOrders,
  isProviderOrdersLoading,
  refetchProviderOrders,
  activeOrderId,
  setActiveOrderId,
  onOpenSupport,
  isSupportOpen,
  providerSearchQuery,
  setProviderSearchQuery,
  providerActiveFilter,
  setProviderActiveFilter,
  onOpenProfile,
  onStartNewOrder,
  onOpenSkillsModal,
  onOpenTeamManagement,
  onOpenLeveling,
  onOpenStartChat,
  counselorChatItems,
  isCounselorOrdersLoading,
  counselorActiveTab,
  setCounselorActiveTab,
  counselorSearchQuery,
  setCounselorSearchQuery,
  counselorSelectedChatId,
  onSelectCounselorChat,
  counselorTabCounts,
  isCounselorOnline,
  onToggleCounselorOnline,
  onOpenAddCustomer,
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
  // Staff roles keep the options-menu header (restyled to Figma); guests/customers get the Join Now header.
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const isAdmin = activeRole === 'ADMIN';
  const isStaffView = Boolean(activeRole && activeRole !== 'CUSTOMER');
  const bgSidebar = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';

  return (
    <section
      className={`${
        mobileView === 'LIST' ? 'flex' : 'hidden md:flex'
      } flex-col w-full md:w-[380px] lg:w-[420px] border-r shrink-0 h-full relative z-10 ${bgSidebar}`}
      style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
    >
      {isStaffView && !isProvider && !isAdmin && (
      <SidebarHeader
        isDarkMode={isDarkMode}
        soundEnabled={soundEnabled}
        runningCount={runningCount}
        onToggleSound={onToggleSound}
        onSelectWelcome={onSelectWelcome}
        onOpenSettings={onOpenSettings}
        onOpenOrders={onOpenOrders}
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogout={onLogout}
      />
      )}

      {isAdmin && user && (activeRailTab === 'SUPPORT_PROVIDERS' || activeRailTab === 'SUPPORT_CUSTOMERS') ? (
        <SupportDirectorySidebar
          user={user}
          role={activeRailTab === 'SUPPORT_PROVIDERS' ? 'PROVIDER' : 'CUSTOMER'}
          onMemberOpened={() => setMobileView('CHAT')}
          onOpenAuth={() => onOpenAuth('LOGIN')}
        />
      ) : isAdmin && user && activeRailTab === 'SERVICES' ? (
        <AdminServicesSidebar user={user} onServiceOpened={() => setMobileView('CHAT')} onOpenAuth={() => onOpenAuth('LOGIN')} />
      ) : isAdmin && user ? (
        /* Role: ADMIN - every order on the platform, same list design as the provider */
        <AdminOrdersSidebar user={user} onOrderOpened={() => setMobileView('CHAT')} onOpenAuth={() => onOpenAuth('LOGIN')} />
      ) : isProvider && user ? (
        /* Role: PROVIDER - the Figma landing list: profile with due + Pay Now, search, chips, one row per order */
        <ProviderOrdersSidebar
          user={user}
          orders={providerOrders}
          isLoading={isProviderOrdersLoading}
          activeOrderId={activeOrderId}
          onSelectOrder={(order) => {
            setActiveOrderId(order.id);
            setMobileView('CHAT');
          }}
          onOpenAuth={() => onOpenAuth('LOGIN')}
          onOpenSkills={onOpenSkillsModal}
          onOpenSupport={onOpenSupport}
          isSupportOpen={isSupportOpen}
        />
      ) : isCounselor ? (
        /* Role: COUNSELOR - Shows 4 Control Panel Tabs (Public, Ongoing, Hold, Completed) */
        <CounselorChatList
          items={counselorChatItems}
          isLoading={isCounselorOrdersLoading}
          activeTab={counselorActiveTab}
          onSelectTab={setCounselorActiveTab}
          searchQuery={counselorSearchQuery}
          onSearchChange={setCounselorSearchQuery}
          selectedChatId={counselorSelectedChatId}
          onSelectChat={onSelectCounselorChat}
          tabCounts={counselorTabCounts}
          isOnline={isCounselorOnline}
          onToggleOnline={onToggleCounselorOnline}
          onOpenAddCustomer={onOpenAddCustomer}
          isDarkMode={isDarkMode}
        />
      ) : activeRailTab === 'ORDERS' && isAuthenticated && user ? (
        /* Role: CUSTOMER - the Orders rail icon swaps the services list for the customer's own orders */
        <CustomerOrdersSidebar
          user={user}
          onStartNewOrder={onStartNewOrder}
          onOpenAuth={() => onOpenAuth('LOGIN')}
          onOpenProfile={onOpenProfile}
          onOrderOpened={() => setMobileView('CHAT')}
        />
      ) : (
        /* Role: CUSTOMER / GUEST - Shows Services Catalog */
        <>
          <CustomerSidebarTop
            isAuthenticated={isAuthenticated}
            user={user}
            onStartNewOrder={onStartNewOrder}
            onOpenAuth={() => onOpenAuth('LOGIN')}
            onOpenOrders={onOpenOrders}
            onOpenAccount={onOpenProfile}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
            activeFilterChip={activeFilterChip}
            onSelectFilterChip={setActiveFilterChip}
            categoryNames={categoryNames}
            showBrandRow={!isStaffView}
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
            onOpenAuth={() => onOpenAuth('LOGIN')}
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
