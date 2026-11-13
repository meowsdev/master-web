'use client';

import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { ProviderOrderList, ProviderOrderFilter } from './ProviderOrderList';
import { CounselorChatList } from './CounselorChatList';
import { SearchAndFilters } from './SearchAndFilters';
import { ServiceList } from './ServiceList';
import { Order } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { Service } from '@/types/service.types';
import { ChatMessage, CustomFilterList } from '@/types/super-app.types';
import { CounselorTab, CounselorChatItem } from '@/types/counselor.types';

interface SuperAppSidebarProps {
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
  providerSearchQuery: string;
  setProviderSearchQuery: (q: string) => void;
  providerActiveFilter: ProviderOrderFilter;
  setProviderActiveFilter: (f: ProviderOrderFilter) => void;
  onOpenProfile: () => void;
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
  allDbServicesCount: number;
  isServicesLoading: boolean;
  activeServiceId: string | null;
  onSelectService: (s: Service) => void;
  serviceMessages: Record<string, ChatMessage[]>;
}

export function SuperAppSidebar({
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
  providerSearchQuery,
  setProviderSearchQuery,
  providerActiveFilter,
  setProviderActiveFilter,
  onOpenProfile,
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
  isSearchFocused,
  setIsSearchFocused,
  activeFilterChip,
  setActiveFilterChip,
  customFilters,
  onOpenCreateFilter,
  onDeleteCustomFilter,
  runningServiceIds,
  filteredServices,
  allDbServicesCount,
  isServicesLoading,
  activeServiceId,
  onSelectService,
  serviceMessages,
}: SuperAppSidebarProps) {
  const bgSidebar = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';

  return (
    <section
      className={`${
        mobileView === 'LIST' ? 'flex' : 'hidden md:flex'
      } flex-col w-full md:w-[380px] lg:w-[420px] border-r shrink-0 h-full relative z-10 ${bgSidebar}`}
    >
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

      {isProvider ? (
        /* Role: PROVIDER - Shows Assigned Job Orders & Dispatches */
        <ProviderOrderList
          orders={providerOrders}
          isLoading={isProviderOrdersLoading}
          onRefresh={refetchProviderOrders}
          activeOrderId={activeOrderId}
          onSelectOrder={(order) => {
            setActiveOrderId(order.id);
            setMobileView('CHAT');
          }}
          searchQuery={providerSearchQuery}
          onSearchChange={setProviderSearchQuery}
          activeFilter={providerActiveFilter}
          onSelectFilter={setProviderActiveFilter}
          user={user}
          onOpenProfile={onOpenProfile}
          onOpenSkillsModal={onOpenSkillsModal}
          onOpenTeamManagement={onOpenTeamManagement}
          onOpenLeveling={onOpenLeveling}
          onOpenStartChat={onOpenStartChat}
          isDarkMode={isDarkMode}
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
      ) : (
        /* Role: CUSTOMER / GUEST - Shows Services Catalog */
        <>
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchFocused={isSearchFocused}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
            activeFilterChip={activeFilterChip}
            onSelectFilterChip={setActiveFilterChip}
            customFilters={customFilters}
            onOpenCreateFilter={onOpenCreateFilter}
            onDeleteCustomFilter={onDeleteCustomFilter}
            activeRole={activeRole}
            runningCount={runningServiceIds.length}
            isDarkMode={isDarkMode}
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
            activeFilterChip={activeFilterChip}
            isDarkMode={isDarkMode}
          />
        </>
      )}
    </section>
  );
}
