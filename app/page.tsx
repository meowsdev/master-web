'use client';

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import {
  RailTab,
  DHAKA_AREAS,
  PaymentMode,
} from '@/types/super-app.types';

// Custom Hooks
import { useServicesFilter } from '@/hooks/useServicesFilter';
import { useSuperAppAudio } from '@/hooks/useSuperAppAudio';
import { useSuperAppChat } from '@/hooks/useSuperAppChat';
import { useProviderOrders } from '@/hooks/useProviderOrders';

// Super App UI Components
import { NavigationRail } from '@/components/super-app/NavigationRail';
import { SidebarHeader } from '@/components/super-app/SidebarHeader';
import { SearchAndFilters } from '@/components/super-app/SearchAndFilters';
import { ServiceList } from '@/components/super-app/ServiceList';
import { ProviderOrderList } from '@/components/super-app/ProviderOrderList';
import { ProviderOrderCanvas } from '@/components/super-app/ProviderOrderCanvas';
import { CustomerChatCanvas } from '@/components/super-app/CustomerChatCanvas';
import { WelcomeScreen } from '@/components/super-app/WelcomeScreen';
import { SuperAppModals } from '@/components/super-app/SuperAppModals';

const emptySubscribe = () => () => {};

export default function SuperAppPage() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { user, isAuthenticated, activeRole, logout, setRole, setUser } = useAuthStore();

  const isProvider = Boolean(
    isAuthenticated && (activeRole === 'PROVIDER' || user?.role === 'PROVIDER')
  );

  // Theme & Sound states
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const t = localStorage.getItem('superapp_theme');
    return t === 'dark' || (!t && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches));
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('superapp_sound') !== 'false' : true;
  });

  const { playSound } = useSuperAppAudio(soundEnabled);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try { localStorage.setItem('superapp_theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('superapp_sound', String(next)); } catch {}
      toast.info(`Sound: ${next ? 'ON' : 'OFF'}`);
      return next;
    });
  }, []);

  // Far-left Rail Tab
  const [activeRailTab, setActiveRailTab] = useState<RailTab>('CHATS');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingAddress, setBookingAddress] = useState(DHAKA_AREAS[0]);
  const [bookingTime, setBookingTime] = useState('Today, Within 2 Hours');
  const [bookingPaymentMode, setBookingPaymentMode] = useState<PaymentMode>('CASH');

  // Calling, Status viewer, and Service details modals
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.location.search.includes('view=orders') : false;
  });
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const openSettings = useCallback(() => setIsSettingsDrawerOpen(true), []);
  const openOrders = useCallback(() => setIsOrdersDrawerOpen(true), []);
  const openSkillsModal = useCallback(() => setIsSkillsModalOpen(true), []);

  // Chat management hook with strict authentication guards & running order tracking
  const {
    activeServiceId,
    setActiveServiceId,
    serviceMessages,
    inputText,
    setInputText,
    mobileView,
    setMobileView,
    messagesEndRef,
    scrollToBottom,
    handleSelectService,
    handleSendMessage,
    handleSendVoiceNote,
    handleReactToMessage,
    handleConfirmBooking,
    handleCompleteOrder,
    handleReopenOrderRevision,
    handleClearChat,
    activeOrder,
    activeOrderMessageId,
    activeServiceRunningOrder,
    runningServiceIds,
    serviceLastActivity,
  } = useSuperAppChat({ playSound });

  // Services & Filter computation hook
  const {
    dbServices,
    isServicesLoading,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    activeFilterChip,
    setActiveFilterChip,
    customFilters,
    createCustomFilter,
    deleteCustomFilter,
    toggleSaveService,
    isServiceSaved,
    isFilterModalOpen,
    setIsFilterModalOpen,
    filteredServices,
  } = useServicesFilter({ runningServiceIds, serviceLastActivity });

  // Dedicated Provider Orders Hook
  const {
    orders: providerOrders,
    isLoading: isProviderOrdersLoading,
    refetch: refetchProviderOrders,
    activeOrderId,
    setActiveOrderId,
    activeOrder: activeProviderOrder,
    searchQuery: providerSearchQuery,
    setSearchQuery: setProviderSearchQuery,
    activeFilter: providerActiveFilter,
    setActiveFilter: setProviderActiveFilter,
    handleUpdateStatus,
    isUpdatingStatus,
  } = useProviderOrders({ isProvider });

  // Active selected service object (for Customer view)
  const activeService = useMemo(() => {
    if (!activeServiceId) return null;
    return dbServices.find((s) => s.id === activeServiceId) || null;
  }, [dbServices, activeServiceId]);

  // Current active service chat messages
  const currentMessages = useMemo(() => {
    if (!activeServiceId) return [];
    return serviceMessages[activeServiceId] || [];
  }, [serviceMessages, activeServiceId]);

  // Sync dark class on document element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  const handleOpenAuth = useCallback((mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.info('Logged out');
  }, [logout]);

  const handleStartCall = useCallback(
    (type: 'voice' | 'video') => {
      if (!isAuthenticated) {
        toast.info('Please log in with your phone number to start a consultation call.');
        handleOpenAuth();
        return;
      }
      setCallType(type);
      setIsCallingModalOpen(true);
    },
    [isAuthenticated, handleOpenAuth]
  );

  const handleToggleSave = useCallback(() => {
    if (!activeService) return;
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to save services.');
      handleOpenAuth();
      return;
    }
    toggleSaveService(activeService.id);
  }, [activeService, isAuthenticated, handleOpenAuth, toggleSaveService]);

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to book services.');
      handleOpenAuth();
      return;
    }
    if (activeServiceRunningOrder) {
      toast.warning(
        `Active Order #${activeServiceRunningOrder.orderId} for "${activeService?.name}" is already running!`
      );
      return;
    }
    setIsBookingModalOpen(true);
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]">
        <div className="w-10 h-10 rounded-full border-3 border-[#008069] border-t-transparent animate-spin" />
      </div>
    );
  }

  const bgMain = isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]';
  const bgSidebar = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${bgMain}`}>
      {/* 1. Far-Left Navigation Rail (60px) */}
      <NavigationRail
        activeRailTab={activeRailTab}
        onSelectTab={setActiveRailTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenSettings={openSettings}
        onOpenStatus={() => setIsStatusViewerOpen(true)}
        onOpenOrders={openOrders}
        user={user}
        activeRole={activeRole}
        runningCount={isProvider ? providerOrders.length : runningServiceIds.length}
      />

      {/* 2. Middle Column: Sidebar (Provider Assigned Orders OR Customer Services) */}
      <section
        className={`${
          mobileView === 'LIST' ? 'flex' : 'hidden md:flex'
        } flex-col w-full md:w-[380px] lg:w-[420px] border-r shrink-0 h-full relative z-10 ${bgSidebar}`}
      >
        <SidebarHeader
          isDarkMode={isDarkMode}
          soundEnabled={soundEnabled}
          runningCount={isProvider ? providerOrders.length : runningServiceIds.length}
          onToggleSound={toggleSound}
          onSelectWelcome={() => {
            setActiveServiceId(null);
            setActiveOrderId(null);
          }}
          onOpenSettings={openSettings}
          onOpenOrders={openOrders}
          onOpenAuth={handleOpenAuth}
          isAuthenticated={isAuthenticated}
          userName={user?.name}
          onLogout={handleLogout}
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
            onOpenProfile={() => setIsProfileEditorOpen(true)}
            onOpenSkillsModal={openSkillsModal}
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
              onOpenCreateFilter={() => {
                if (!isAuthenticated) {
                  toast.info('Please log in with your phone number to create custom filter lists.');
                  handleOpenAuth('LOGIN');
                  return;
                }
                setIsFilterModalOpen(true);
              }}
              onDeleteCustomFilter={deleteCustomFilter}
              activeRole={activeRole}
              runningCount={runningServiceIds.length}
              isDarkMode={isDarkMode}
            />

            <ServiceList
              services={filteredServices}
              allDbServicesCount={dbServices.length}
              isLoading={isServicesLoading}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              activeServiceId={activeServiceId}
              onSelectService={handleSelectService}
              isAuthenticated={isAuthenticated}
              user={user}
              activeRole={activeRole}
              onOpenAuth={() => handleOpenAuth('LOGIN')}
              onOpenProfile={() => setIsProfileEditorOpen(true)}
              runningServiceIds={runningServiceIds}
              serviceMessages={serviceMessages}
              activeFilterChip={activeFilterChip}
              isDarkMode={isDarkMode}
            />
          </>
        )}
      </section>

      {/* 3. Right Main Area: Provider Order Canvas OR Customer Service Chat OR Welcome Screen */}
      <main
        className={`${
          mobileView === 'CHAT' ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 h-full relative z-0 min-w-0`}
      >
        {isProvider && activeProviderOrder ? (
          /* Provider Order Workspace */
          <ProviderOrderCanvas
            order={activeProviderOrder}
            onBack={() => setMobileView('LIST')}
            onUpdateStatus={handleUpdateStatus}
            isUpdatingStatus={isUpdatingStatus}
            onStartCall={handleStartCall}
            isDarkMode={isDarkMode}
          />
        ) : !isProvider && activeService && activeServiceId ? (
          /* Customer Service Chat Window */
          <CustomerChatCanvas
            activeService={activeService}
            activeServiceId={activeServiceId}
            activeOrder={activeOrder}
            activeOrderMessageId={activeOrderMessageId}
            currentMessages={currentMessages}
            inputText={inputText}
            onInputChange={setInputText}
            onBackMobile={() => setMobileView('LIST')}
            onBackToWelcome={() => setActiveServiceId(null)}
            onOpenBooking={handleOpenBooking}
            onStartCall={handleStartCall}
            onClearChat={handleClearChat}
            isSaved={isServiceSaved(activeService.id)}
            onToggleSave={handleToggleSave}
            onOpenDetails={() => setIsServiceDetailsOpen(true)}
            onCompleteOrder={handleCompleteOrder}
            onReactToMessage={handleReactToMessage}
            onSendMessage={() => handleSendMessage(isAuthenticated, () => handleOpenAuth('LOGIN'))}
            onSendVoiceNote={() => handleSendVoiceNote(isAuthenticated, () => handleOpenAuth('LOGIN'))}
            isAuthenticated={isAuthenticated}
            onOpenAuth={() => handleOpenAuth('LOGIN')}
            onOpenOrders={openOrders}
            messagesEndRef={messagesEndRef}
            isDarkMode={isDarkMode}
          />
        ) : (
          <WelcomeScreen
            isAuthenticated={isAuthenticated}
            user={user}
            activeRole={activeRole}
            onOpenAuth={handleOpenAuth}
            onOpenSettings={openSettings}
            onOpenOrders={openOrders}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <SuperAppModals
        isDarkMode={isDarkMode}
        user={user}
        activeRole={activeRole}
        isAuthenticated={isAuthenticated}
        isBookingModalOpen={isBookingModalOpen}
        onCloseBooking={() => setIsBookingModalOpen(false)}
        activeService={activeService}
        activeServiceRunningOrder={activeServiceRunningOrder}
        bookingAddress={bookingAddress}
        onAddressChange={setBookingAddress}
        bookingTime={bookingTime}
        onTimeChange={setBookingTime}
        bookingPaymentMode={bookingPaymentMode}
        onPaymentModeChange={setBookingPaymentMode}
        onConfirmBooking={() =>
          handleConfirmBooking(
            activeService,
            bookingAddress,
            bookingTime,
            bookingPaymentMode,
            isAuthenticated,
            handleOpenAuth,
            () => setIsBookingModalOpen(false)
          )
        }
        isAuthModalOpen={isAuthModalOpen}
        onCloseAuth={() => setIsAuthModalOpen(false)}
        authInitialMode={authInitialMode}
        onOpenAuth={handleOpenAuth}
        isCallingModalOpen={isCallingModalOpen}
        onCloseCalling={() => setIsCallingModalOpen(false)}
        callType={callType}
        onStartCall={handleStartCall}
        isStatusViewerOpen={isStatusViewerOpen}
        onCloseStatusViewer={() => setIsStatusViewerOpen(false)}
        isSettingsDrawerOpen={isSettingsDrawerOpen}
        onCloseSettings={() => setIsSettingsDrawerOpen(false)}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onSwitchRole={setRole}
        onOpenEditProfile={() => setIsProfileEditorOpen(true)}
        onOpenOrders={openOrders}
        onOpenSkillsModal={openSkillsModal}
        onLogout={handleLogout}
        isProfileEditorOpen={isProfileEditorOpen}
        onCloseProfileEditor={() => setIsProfileEditorOpen(false)}
        onUserUpdated={setUser}
        isSkillsModalOpen={isSkillsModalOpen}
        onCloseSkillsModal={() => setIsSkillsModalOpen(false)}
        isFilterModalOpen={isFilterModalOpen}
        onCloseFilterModal={() => setIsFilterModalOpen(false)}
        dbServices={dbServices}
        createCustomFilter={createCustomFilter}
        isServiceDetailsOpen={isServiceDetailsOpen}
        onCloseServiceDetails={() => setIsServiceDetailsOpen(false)}
        isServiceSaved={activeService ? isServiceSaved(activeService.id) : false}
        onToggleSave={handleToggleSave}
        onOpenBooking={handleOpenBooking}
        isOrdersDrawerOpen={isOrdersDrawerOpen}
        onCloseOrdersDrawer={() => setIsOrdersDrawerOpen(false)}
        onOrderRevisionRequested={handleReopenOrderRevision}
        onSelectServiceById={(serviceId) => {
          const target = dbServices.find((s) => s.id === serviceId);
          if (target) handleSelectService(target);
        }}
      />
    </div>
  );
}
