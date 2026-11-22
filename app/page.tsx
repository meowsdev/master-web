'use client';

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { logoutUser } from '@/lib/logout';
import { RailTab } from '@/types/super-app.types';

// Custom Hooks
import { useServicesFilter } from '@/hooks/useServicesFilter';
import { useSuperAppAudio } from '@/hooks/useSuperAppAudio';
import { useSuperAppChat } from '@/hooks/useSuperAppChat';
import { useProviderOrders } from '@/hooks/useProviderOrders';
import { useSuperAppModals } from '@/hooks/useSuperAppModals';
import { useGuestServicePreview } from '@/hooks/useGuestServicePreview';
import { useCustomerOrderTabSelection } from '@/hooks/useCustomerOrderTabSelection';
import { useSupportChatNavigation } from '@/hooks/useSupportChatNavigation';
import { useServiceSelectionReadSync } from '@/hooks/useServiceSelectionReadSync';

// Super App UI Components
import { NavigationRail } from '@/components/super-app/NavigationRail';
import { SuperAppSidebar } from '@/components/super-app/SuperAppSidebar';
import { MainCanvasArea } from '@/components/super-app/MainCanvasArea';
import { ServicePreviewPanel } from '@/components/modals/ServicePreviewPanel';
import { SuperAppModals } from '@/components/super-app/SuperAppModals';

const emptySubscribe = () => () => {};

/*
 * The one WhatsApp-style app for every role: rail, list, canvas. What each part shows is decided by the role
 * (customer, provider, technician) or, for staff, by their permissions (lib/roles.ts).
 */
export default function SuperAppPage() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { user, isAuthenticated, activeRole, setRole, setUser } = useAuthStore();

  const isProvider = Boolean(isAuthenticated && (activeRole === 'PROVIDER' || user?.role === 'PROVIDER'));

  // The app ships light-only for now; every component still receives the flag so a dark theme can return later.
  const isDarkMode = false;

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('superapp_sound') !== 'false' : true;
  });

  const { playSound } = useSuperAppAudio(soundEnabled);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('superapp_sound', String(next)); } catch {}
      toast.info(`Sound: ${next ? 'ON' : 'OFF'}`);
      return next;
    });
  }, []);

  const [activeRailTab, setActiveRailTab] = useState<RailTab>('CHATS');
  const modals = useSuperAppModals();

  const {
    activeServiceId,
    setActiveServiceId,
    serviceMessages,
    mobileView,
    setMobileView,
    handleSelectService,
    handleCompleteOrder,
    handleReopenOrderRevision,
    handleClearChat,
    activeOrder,
    activeOrderMessageId,
    runningServiceIds,
    serviceLastActivity,
    resetChatSession,
  } = useSuperAppChat({ playSound, userId: user?.id });

  const {
    dbServices,
    isServicesLoading,
    searchQuery,
    setSearchQuery,
    setIsSearchFocused,
    activeFilterChip,
    setActiveFilterChip,
    filteredServices,
    categoryNames,
    conversationByServiceId,
  } = useServicesFilter({ runningServiceIds, serviceLastActivity });

  const {
    orders: providerOrders,
    isLoading: isProviderOrdersLoading,
    activeOrderId,
    setActiveOrderId,
    activeOrder: activeProviderOrder,
    handleUpdateStatus,
    isUpdatingStatus,
  } = useProviderOrders({ isProvider, userId: user?.id, playSound });

  const activeService = useMemo(() => {
    if (!activeServiceId) return null;
    return dbServices.find((s) => s.id === activeServiceId) || null;
  }, [dbServices, activeServiceId]);

  const currentMessages = useMemo(() => {
    if (!activeServiceId) return [];
    return serviceMessages[activeServiceId] || [];
  }, [serviceMessages, activeServiceId]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  const handleLogout = useCallback(() => {
    // Revokes the server session, clears cookies, wipes caches and tells the
    // other tabs; resetChatSession also drops the in-memory chat state.
    resetChatSession();
    void logoutUser();
    toast.info('Logged out');
  }, [resetChatSession]);

  const handleStartCall = useCallback(
    (type: 'voice' | 'video') => {
      if (!isAuthenticated) {
        toast.info('Please log in with your phone number to start a consultation call.');
        modals.handleOpenAuth();
        return;
      }
      modals.setCallType(type);
      modals.setIsCallingModalOpen(true);
    },
    [isAuthenticated, modals]
  );

  const handleSelectServiceWithReadSync = useServiceSelectionReadSync({
    userId: user?.id,
    conversationByServiceId,
    selectService: handleSelectService,
  });

  // Logged-out visitors see a service's public page; Contact Now leads through login to its chat.
  const { previewService, openPreview, closePreview, handleContactNow, cancelContact } = useGuestServicePreview({
    isAuthenticated,
    onOpenAuth: () => modals.handleOpenAuth('LOGIN'),
    onOpenChat: (service) => {
      // They came to contact this service: skip the profile panel and land in its chat.
      modals.setIsAuthModalOpen(false);
      handleSelectServiceWithReadSync(service);
    },
  });

  // Both the header "Book Service" button and the + buttons open the Place Order panel.
  // Whether an order is allowed (e.g. one active order per service) is the backend's call.
  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to book services.');
      modals.handleOpenAuth();
      return;
    }
    modals.openPlaceOrder(activeService?.id ?? null);
  };

  const { selectedOrderId, selectOrderTab, handleOrderPlaced } = useCustomerOrderTabSelection({
    userId: user?.id,
    activeService,
    dbServices,
    closePlaceOrderPanel: () => modals.setIsPlaceOrderOpen(false),
    selectService: handleSelectServiceWithReadSync,
  });

  const { openSupportChat, leaveSupportChat } = useSupportChatNavigation({
    setActiveRailTab,
    setMobileView,
    deselectChats: () => { setActiveServiceId(null); setActiveOrderId(null); },
  });

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]">
        <div className="w-10 h-10 rounded-full border-3 border-[#008069] border-t-transparent animate-spin" />
      </div>
    );
  }

  const bgMain = isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]';
  // The + buttons open the Place Order panel; the customer picks the service inside it.
  const handleStartNewOrder = () => {
    setActiveRailTab('CHATS');
    if (isAuthenticated) modals.openPlaceOrder(null);
    else modals.handleOpenAuth('LOGIN');
  };
  const runningBadgeCount = isProvider ? providerOrders.length : runningServiceIds.length;

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${bgMain}`}>
      {/* 1. Far-left navigation rail */}
      <NavigationRail
        activeRailTab={modals.isOrdersDrawerOpen ? 'ORDERS' : modals.isProfileEditorOpen || modals.isAuthModalOpen ? 'ACCOUNT' : activeRailTab}
        onSelectTab={(tab) => {
          setActiveRailTab(tab);
          if (tab === 'CHATS') modals.closeSidePanels();
        }}
        onOpenProfile={() => modals.setIsProfileEditorOpen(true)}
        onOpenAuth={() => modals.handleOpenAuth('LOGIN')}
        onStartNewOrder={handleStartNewOrder}
        user={user}
        activeRole={activeRole}
        runningCount={runningBadgeCount}
      />

      {/* 2. Middle column: the list for this role */}
      <SuperAppSidebar
        activeRailTab={activeRailTab}
        mobileView={mobileView}
        setMobileView={setMobileView}
        isDarkMode={isDarkMode}
        onOpenOrders={modals.openOrders}
        onStartNewOrder={handleStartNewOrder}
        onOpenAuth={modals.handleOpenAuth}
        isAuthenticated={isAuthenticated}
        isProvider={isProvider}
        user={user}
        activeRole={activeRole}
        providerOrders={providerOrders}
        isProviderOrdersLoading={isProviderOrdersLoading}
        activeOrderId={activeOrderId}
        setActiveOrderId={(id) => { if (id) leaveSupportChat(); setActiveOrderId(id); }}
        onOpenSupport={openSupportChat}
        onLeaveSupport={leaveSupportChat}
        isSupportOpen={activeRailTab === 'SUPPORT'}
        onOpenProfile={() => modals.setIsProfileEditorOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsSearchFocused={setIsSearchFocused}
        activeFilterChip={activeFilterChip}
        setActiveFilterChip={setActiveFilterChip}
        runningServiceIds={runningServiceIds}
        filteredServices={filteredServices}
        categoryNames={categoryNames}
        allDbServicesCount={dbServices.length}
        isServicesLoading={isServicesLoading}
        activeServiceId={activeServiceId}
        onSelectService={(service) => { if (isAuthenticated) { leaveSupportChat(); return handleSelectServiceWithReadSync(service); } modals.closeSidePanels(); openPreview(service); }}
        serviceMessages={serviceMessages}
        conversationByServiceId={conversationByServiceId}
      />

      {/* 3. Right: the open chat / order for this role */}
      <MainCanvasArea
        activeRailTab={activeRailTab}
        isSidePanelOpen={modals.isAnySidePanelOpen || previewService !== null}
        mobileView={mobileView}
        setMobileView={setMobileView}
        isProvider={isProvider}
        activeProviderOrder={activeProviderOrder}
        handleUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={isUpdatingStatus}
        activeService={activeService}
        activeServiceId={activeServiceId}
        setActiveServiceId={setActiveServiceId}
        activeOrder={activeOrder}
        activeOrderMessageId={activeOrderMessageId}
        currentMessages={currentMessages}
        handleOpenBooking={handleOpenBooking}
        handleStartCall={handleStartCall}
        handleClearChat={handleClearChat}
        setIsServiceDetailsOpen={modals.setIsServiceDetailsOpen}
        handleCompleteOrder={handleCompleteOrder}
        isAuthenticated={isAuthenticated}
        handleOpenAuth={modals.handleOpenAuth}
        openOrders={modals.openOrders}
        onStartNewOrder={handleStartNewOrder}
        selectedOrderId={selectedOrderId}
        onSelectOrderTab={selectOrderTab}
        openSettings={modals.openSettings}
        handleLogout={handleLogout}
        isDarkMode={isDarkMode}
        user={user}
        activeRole={activeRole}
      />

      {/* 4. Global drawers & modals */}
      <SuperAppModals
        isDarkMode={isDarkMode}
        user={user}
        activeRole={activeRole}
        isAuthenticated={isAuthenticated}
        isPlaceOrderOpen={modals.isPlaceOrderOpen}
        onClosePlaceOrder={() => modals.setIsPlaceOrderOpen(false)}
        placeOrderServiceId={modals.placeOrderServiceId}
        onOrderPlaced={handleOrderPlaced}
        activeService={activeService}
        isAuthModalOpen={modals.isAuthModalOpen}
        onCloseAuth={() => { modals.setIsAuthModalOpen(false); cancelContact(); }}
        authInitialMode={modals.authInitialMode}
        onOpenAuth={modals.handleOpenAuth}
        isCallingModalOpen={modals.isCallingModalOpen}
        onCloseCalling={() => modals.setIsCallingModalOpen(false)}
        callType={modals.callType}
        isSettingsDrawerOpen={modals.isSettingsDrawerOpen}
        onCloseSettings={() => modals.setIsSettingsDrawerOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onSwitchRole={setRole}
        onOpenEditProfile={() => modals.setIsProfileEditorOpen(true)}
        onOpenOrders={modals.openOrders}
        onLogout={handleLogout}
        isProfileEditorOpen={modals.isProfileEditorOpen}
        onCloseProfileEditor={() => modals.setIsProfileEditorOpen(false)}
        onUserUpdated={setUser}
        isServiceDetailsOpen={modals.isServiceDetailsOpen}
        onCloseServiceDetails={() => modals.setIsServiceDetailsOpen(false)}
        onOpenBooking={handleOpenBooking}
        isOrdersDrawerOpen={modals.isOrdersDrawerOpen}
        onCloseOrdersDrawer={() => modals.setIsOrdersDrawerOpen(false)}
        onOrderRevisionRequested={handleReopenOrderRevision}
        onSelectServiceById={(id) => { const target = dbServices.find((s) => s.id === id); if (target) handleSelectServiceWithReadSync(target); }}
      />

      {!isAuthenticated && (
        <ServicePreviewPanel service={modals.isAnySidePanelOpen ? null : previewService} onClose={closePreview} primaryActionLabel="Contact Now" onPrimaryAction={handleContactNow} />
      )}
    </div>
  );
}
