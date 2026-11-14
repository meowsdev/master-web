'use client';

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { RailTab } from '@/types/super-app.types';
import { chatService } from '@/services/chat.service';
import { ChatSession } from '@/types/chat.types';

// Custom Hooks
import { useServicesFilter } from '@/hooks/useServicesFilter';
import { useSuperAppAudio } from '@/hooks/useSuperAppAudio';
import { useSuperAppChat } from '@/hooks/useSuperAppChat';
import { useProviderOrders } from '@/hooks/useProviderOrders';
import { useOrderNegotiation } from '@/hooks/useOrderNegotiation';
import { useCounselorWorkspace } from '@/hooks/useCounselorWorkspace';
import { useSuperAppModals } from '@/hooks/useSuperAppModals';

// Super App UI Components
import { NavigationRail } from '@/components/super-app/NavigationRail';
import { SuperAppSidebar } from '@/components/super-app/SuperAppSidebar';
import { MainCanvasArea } from '@/components/super-app/MainCanvasArea';
import { SuperAppModals } from '@/components/super-app/SuperAppModals';
import { AddCustomerModal, CreateCustomOrderModal, ModifyPriceModal } from '@/components/modals/CounselorActionModals';

const emptySubscribe = () => () => {};

export default function SuperAppPage() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const queryClient = useQueryClient();
  const { user, isAuthenticated, activeRole, logout, setRole, setUser } = useAuthStore();

  const isProvider = Boolean(isAuthenticated && (activeRole === 'PROVIDER' || user?.role === 'PROVIDER'));
  const isCounselor = Boolean(isAuthenticated && (activeRole === 'COUNSELOR' || user?.role === 'COUNSELOR'));

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

  const [activeRailTab, setActiveRailTab] = useState<RailTab>('CHATS');
  const modals = useSuperAppModals();

  const {
    activeServiceId,
    setActiveServiceId,
    serviceMessages,
    setServiceMessages,
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
    resetChatSession,
  } = useSuperAppChat({ playSound, userId: user?.id });

  const {
    handlePayAdvance,
    handleAcceptPrice,
    handleRejectPrice,
    handleSatisfactionResponse,
  } = useOrderNegotiation({
    activeServiceId,
    setServiceMessages,
    playWhatsAppChime: () => playSound('receive'),
    userId: user?.id,
  });

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
    conversationByServiceId,
  } = useServicesFilter({ runningServiceIds, serviceLastActivity });

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
  } = useProviderOrders({ isProvider, userId: user?.id });

  const {
    activeTab: counselorActiveTab,
    setActiveTab: setCounselorActiveTab,
    searchQuery: counselorSearchQuery,
    setSearchQuery: setCounselorSearchQuery,
    selectedChatId: counselorSelectedChatId,
    setSelectedChatId: setCounselorSelectedChatId,
    activeChatItem: activeCounselorChat,
    filteredChatItems: counselorChatItems,
    tabCounts: counselorTabCounts,
    isOrdersLoading: isCounselorOrdersLoading,
    isOnline: isCounselorOnline,
    handleToggleOnlineStatus,
    handleCreateManualLead,
    handleCreateCustomOrder,
    handleModifyPrice,
    handleSendDueReminder,
    handleHoldProvider,
  } = useCounselorWorkspace({ isCounselor, userId: user?.id });

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

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  const handleLogout = useCallback(() => {
    queryClient.clear();
    resetChatSession();
    logout();
    toast.info('Logged out');
  }, [queryClient, resetChatSession, logout]);

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

  const handleToggleSave = useCallback(() => {
    if (!activeService) return;
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to save services.');
      modals.handleOpenAuth();
      return;
    }
    toggleSaveService(activeService.id);
  }, [activeService, isAuthenticated, modals, toggleSaveService]);

  const handleSelectServiceWithReadSync = useCallback(
    (service: any) => {
      handleSelectService(service);
      const conv = conversationByServiceId.get(service.id);
      if (conv && (conv.unreadCount ?? 0) > 0) {
        queryClient.setQueryData<ChatSession[]>(['user-conversations', user?.id], (old = []) => {
          if (!Array.isArray(old)) return old;
          return old.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c));
        });
        chatService
          .markConversationAsRead(conv.id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['user-conversations', user?.id] });
          })
          .catch((err) => {
            console.error('Failed to mark conversation as read', err);
          });
      }
    },
    [handleSelectService, conversationByServiceId, queryClient, user?.id]
  );

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to book services.');
      modals.handleOpenAuth();
      return;
    }
    if (activeServiceRunningOrder) {
      toast.warning(`Active Order #${activeServiceRunningOrder.orderId} for "${activeService?.name}" is already running!`);
      return;
    }
    modals.setIsBookingModalOpen(true);
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]">
        <div className="w-10 h-10 rounded-full border-3 border-[#008069] border-t-transparent animate-spin" />
      </div>
    );
  }

  const bgMain = isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]';
  const runningBadgeCount = isProvider ? providerOrders.length : isCounselor ? counselorTabCounts.ongoing : runningServiceIds.length;

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${bgMain}`}>
      {/* 1. Far-Left Navigation Rail (60px) */}
      <NavigationRail
        activeRailTab={activeRailTab}
        onSelectTab={setActiveRailTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenSettings={modals.openSettings}
        onOpenStatus={() => modals.setIsStatusViewerOpen(true)}
        onOpenOrders={modals.openOrders}
        user={user}
        activeRole={activeRole}
        runningCount={runningBadgeCount}
      />

      {/* 2. Middle Column: Role-Based Dynamic WhatsApp List */}
      <SuperAppSidebar
        mobileView={mobileView}
        setMobileView={setMobileView}
        isDarkMode={isDarkMode}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        runningCount={runningBadgeCount}
        onSelectWelcome={() => { setActiveServiceId(null); setActiveOrderId(null); setCounselorSelectedChatId(null); }}
        onOpenSettings={modals.openSettings}
        onOpenOrders={modals.openOrders}
        onOpenAuth={modals.handleOpenAuth}
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        onLogout={handleLogout}
        isProvider={isProvider}
        isCounselor={isCounselor}
        user={user}
        activeRole={activeRole}
        providerOrders={providerOrders}
        isProviderOrdersLoading={isProviderOrdersLoading}
        refetchProviderOrders={refetchProviderOrders}
        activeOrderId={activeOrderId}
        setActiveOrderId={setActiveOrderId}
        providerSearchQuery={providerSearchQuery}
        setProviderSearchQuery={setProviderSearchQuery}
        providerActiveFilter={providerActiveFilter}
        setProviderActiveFilter={setProviderActiveFilter}
        onOpenProfile={() => modals.setIsProfileEditorOpen(true)}
        onOpenSkillsModal={modals.openSkillsModal}
        onOpenTeamManagement={() => modals.setIsTeamManagementOpen(true)}
        onOpenLeveling={() => modals.setIsLevelingDrawerOpen(true)}
        onOpenStartChat={() => modals.setIsStartChatOpen(true)}
        counselorChatItems={counselorChatItems}
        isCounselorOrdersLoading={isCounselorOrdersLoading}
        counselorActiveTab={counselorActiveTab}
        setCounselorActiveTab={setCounselorActiveTab}
        counselorSearchQuery={counselorSearchQuery}
        setCounselorSearchQuery={setCounselorSearchQuery}
        counselorSelectedChatId={counselorSelectedChatId}
        onSelectCounselorChat={(item) => { setCounselorSelectedChatId(item.id); setMobileView('CHAT'); }}
        counselorTabCounts={counselorTabCounts}
        isCounselorOnline={isCounselorOnline}
        onToggleCounselorOnline={handleToggleOnlineStatus}
        onOpenAddCustomer={() => modals.setIsAddCustomerModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        activeFilterChip={activeFilterChip}
        setActiveFilterChip={setActiveFilterChip}
        customFilters={customFilters}
        onOpenCreateFilter={() => {
          if (!isAuthenticated) { toast.info('Please log in with your phone number to create custom filter lists.'); modals.handleOpenAuth('LOGIN'); return; }
          setIsFilterModalOpen(true);
        }}
        onDeleteCustomFilter={deleteCustomFilter}
        runningServiceIds={runningServiceIds}
        filteredServices={filteredServices}
        allDbServicesCount={dbServices.length}
        isServicesLoading={isServicesLoading}
        activeServiceId={activeServiceId}
        onSelectService={handleSelectServiceWithReadSync}
        serviceMessages={serviceMessages}
        conversationByServiceId={conversationByServiceId}
      />

      {/* 3. Right Main Area: Encapsulated Routing & Canvas Area */}
      <MainCanvasArea
        activeRailTab={activeRailTab}
        mobileView={mobileView}
        setMobileView={setMobileView}
        isProvider={isProvider}
        activeProviderOrder={activeProviderOrder}
        handleUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={isUpdatingStatus}
        isCounselor={isCounselor}
        activeCounselorChat={activeCounselorChat}
        onOpenCounselorCreateOrder={() => modals.setIsCreateCustomOrderModalOpen(true)}
        onOpenCounselorModifyPrice={() => modals.setIsModifyPriceModalOpen(true)}
        onCounselorSendDueReminder={handleSendDueReminder}
        onCounselorHoldProvider={handleHoldProvider}
        activeService={activeService}
        activeServiceId={activeServiceId}
        setActiveServiceId={setActiveServiceId}
        activeOrder={activeOrder}
        activeOrderMessageId={activeOrderMessageId}
        currentMessages={currentMessages}
        inputText={inputText}
        setInputText={setInputText}
        handleOpenBooking={handleOpenBooking}
        handleStartCall={handleStartCall}
        handleClearChat={handleClearChat}
        isServiceSaved={isServiceSaved}
        handleToggleSave={handleToggleSave}
        setIsServiceDetailsOpen={modals.setIsServiceDetailsOpen}
        handleCompleteOrder={handleCompleteOrder}
        handleReactToMessage={handleReactToMessage}
        handleSendMessage={handleSendMessage}
        handleSendVoiceNote={handleSendVoiceNote}
        isAuthenticated={isAuthenticated}
        handleOpenAuth={modals.handleOpenAuth}
        openOrders={modals.openOrders}
        openSettings={modals.openSettings}
        handleLogout={handleLogout}
        messagesEndRef={messagesEndRef}
        isDarkMode={isDarkMode}
        user={user}
        activeRole={activeRole}
        runningServiceIds={runningServiceIds}
        dbServices={dbServices}
        handleSelectService={handleSelectService}
        setActiveRailTab={setActiveRailTab}
        handlePayAdvance={handlePayAdvance}
        handleAcceptPrice={handleAcceptPrice}
        handleRejectPrice={handleRejectPrice}
        handleSatisfactionResponse={handleSatisfactionResponse}
      />

      {/* 4. Global Drawers & Modals */}
      <SuperAppModals
        isDarkMode={isDarkMode}
        user={user}
        activeRole={activeRole}
        isAuthenticated={isAuthenticated}
        isBookingModalOpen={modals.isBookingModalOpen}
        onCloseBooking={() => modals.setIsBookingModalOpen(false)}
        activeService={activeService}
        activeServiceRunningOrder={activeServiceRunningOrder}
        bookingAddress={modals.bookingAddress}
        onAddressChange={modals.setBookingAddress}
        bookingTime={modals.bookingTime}
        onTimeChange={modals.setBookingTime}
        bookingPaymentMode={modals.bookingPaymentMode}
        onPaymentModeChange={modals.setBookingPaymentMode}
        onConfirmBooking={() => handleConfirmBooking(activeService, modals.bookingAddress, modals.bookingTime, modals.bookingPaymentMode, isAuthenticated, modals.handleOpenAuth, () => modals.setIsBookingModalOpen(false))}
        isAuthModalOpen={modals.isAuthModalOpen}
        onCloseAuth={() => modals.setIsAuthModalOpen(false)}
        authInitialMode={modals.authInitialMode}
        onOpenAuth={modals.handleOpenAuth}
        isCallingModalOpen={modals.isCallingModalOpen}
        onCloseCalling={() => modals.setIsCallingModalOpen(false)}
        callType={modals.callType}
        onStartCall={handleStartCall}
        isStatusViewerOpen={modals.isStatusViewerOpen}
        onCloseStatusViewer={() => modals.setIsStatusViewerOpen(false)}
        isSettingsDrawerOpen={modals.isSettingsDrawerOpen}
        onCloseSettings={() => modals.setIsSettingsDrawerOpen(false)}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onSwitchRole={setRole}
        onOpenEditProfile={() => modals.setIsProfileEditorOpen(true)}
        onOpenOrders={modals.openOrders}
        onOpenSkillsModal={modals.openSkillsModal}
        onLogout={handleLogout}
        isProfileEditorOpen={modals.isProfileEditorOpen}
        onCloseProfileEditor={() => modals.setIsProfileEditorOpen(false)}
        onUserUpdated={setUser}
        isSkillsModalOpen={modals.isSkillsModalOpen}
        onCloseSkillsModal={() => modals.setIsSkillsModalOpen(false)}
        isFilterModalOpen={isFilterModalOpen}
        onCloseFilterModal={() => setIsFilterModalOpen(false)}
        dbServices={dbServices}
        createCustomFilter={createCustomFilter}
        isServiceDetailsOpen={modals.isServiceDetailsOpen}
        onCloseServiceDetails={() => modals.setIsServiceDetailsOpen(false)}
        isServiceSaved={activeService ? isServiceSaved(activeService.id) : false}
        onToggleSave={handleToggleSave}
        onOpenBooking={handleOpenBooking}
        isOrdersDrawerOpen={modals.isOrdersDrawerOpen}
        onCloseOrdersDrawer={() => modals.setIsOrdersDrawerOpen(false)}
        onOrderRevisionRequested={handleReopenOrderRevision}
        onSelectServiceById={(id) => { const target = dbServices.find((s) => s.id === id); if (target) handleSelectServiceWithReadSync(target); }}
        isTeamManagementOpen={modals.isTeamManagementOpen}
        onCloseTeamManagement={() => modals.setIsTeamManagementOpen(false)}
        isLevelingDrawerOpen={modals.isLevelingDrawerOpen}
        onCloseLevelingDrawer={() => modals.setIsLevelingDrawerOpen(false)}
        isStartChatOpen={modals.isStartChatOpen}
        onCloseStartChat={() => modals.setIsStartChatOpen(false)}
        onProviderStartChat={(id) => { const target = dbServices.find((s) => s.id === id); if (target) handleSelectServiceWithReadSync(target); }}
      />

      {/* 5. Counselor Action Modals (Flow B Manual Lead, Custom Order & Price Modification) */}
      <AddCustomerModal
        isOpen={modals.isAddCustomerModalOpen}
        onClose={() => modals.setIsAddCustomerModalOpen(false)}
        services={dbServices}
        onSubmit={handleCreateManualLead}
        isDarkMode={isDarkMode}
      />

      {activeCounselorChat && (
        <>
          <CreateCustomOrderModal
            isOpen={modals.isCreateCustomOrderModalOpen}
            onClose={() => modals.setIsCreateCustomOrderModalOpen(false)}
            chatItem={activeCounselorChat}
            onSubmit={(dto) => handleCreateCustomOrder(dto, activeCounselorChat.id)}
            isDarkMode={isDarkMode}
          />

          <ModifyPriceModal
            isOpen={modals.isModifyPriceModalOpen}
            onClose={() => modals.setIsModifyPriceModalOpen(false)}
            chatItem={activeCounselorChat}
            onSubmit={handleModifyPrice}
            isDarkMode={isDarkMode}
          />
        </>
      )}
    </div>
  );
}
