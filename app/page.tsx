'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import {
  RailTab,
  STATUS_STORIES,
  DHAKA_AREAS,
  PaymentMode,
} from '@/types/super-app.types';

// Custom Hooks
import { useServicesFilter } from '@/hooks/useServicesFilter';
import { useSuperAppAudio } from '@/hooks/useSuperAppAudio';
import { useSuperAppChat } from '@/hooks/useSuperAppChat';

// Super App UI Components
import { NavigationRail } from '@/components/super-app/NavigationRail';
import { SidebarHeader } from '@/components/super-app/SidebarHeader';
import { SearchAndFilters } from '@/components/super-app/SearchAndFilters';
import { ServiceList } from '@/components/super-app/ServiceList';
import { ChatHeader } from '@/components/super-app/ChatHeader';
import { ChatMessages } from '@/components/super-app/ChatMessages';
import { ChatComposer } from '@/components/super-app/ChatComposer';
import { WelcomeScreen } from '@/components/super-app/WelcomeScreen';
import { ServiceDetailsDrawer } from '@/components/super-app/ServiceDetailsDrawer';

// Dialogs & Drawers
import { BookingModal } from '@/components/modals/BookingModal';
import { AuthModal } from '@/components/modals/AuthModal';
import { CallingModal } from '@/components/modals/CallingModal';
import { StatusViewerModal } from '@/components/modals/StatusViewerModal';
import { SettingsDrawer } from '@/components/modals/SettingsDrawer';
import { CreateFilterModal } from '@/components/modals/CreateFilterModal';

export default function SuperAppPage() {
  const { user, isAuthenticated, activeRole, logout, setRole } = useAuthStore();

  // Theme & Sound states with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSuperAppAudio(soundEnabled);

  // Initialize theme and sound from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('superapp_theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
      }

      const savedSound = localStorage.getItem('superapp_sound');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
    } catch (e) {
      console.error('Failed to read settings from localStorage', e);
    }
  }, []);

  // Toggle and persist theme
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('superapp_theme', next ? 'dark' : 'light');
      } catch (e) {
        console.error('Failed to save theme to localStorage', e);
      }
      return next;
    });
  }, []);

  // Toggle and persist sound
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('superapp_sound', String(next));
      } catch (e) {
        console.error('Failed to save sound to localStorage', e);
      }
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
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false);

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
    handleClearChat,
    activeOrder,
    activeOrderMessageId,
    runningOrder,
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

  // Active selected service object
  const activeService = useMemo(() => {
    if (!activeServiceId) return null;
    return dbServices.find((s) => s.id === activeServiceId) || null;
  }, [dbServices, activeServiceId]);

  // Current active service chat messages
  const currentMessages = useMemo(() => {
    if (!activeServiceId) return [];
    return serviceMessages[activeServiceId] || [];
  }, [serviceMessages, activeServiceId]);

  // Sync dark class on document element for accurate Tailwind dark styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Centralized booking opener: prevents duplicate running orders for the SAME service,
  // while allowing multiple concurrent orders across different services.
  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to book services.');
      handleOpenAuth('LOGIN');
      return;
    }
    if (activeServiceRunningOrder) {
      toast.warning(
        `Active Order #${activeServiceRunningOrder.orderId} for "${activeService?.name}" is already running! Please complete it before placing another order for this service.`
      );
      return;
    }
    setIsBookingModalOpen(true);
  };

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
        onOpenSettings={() => setIsSettingsDrawerOpen(true)}
        onOpenStatus={() => setIsStatusViewerOpen(true)}
        user={user}
        activeRole={activeRole}
        runningCount={runningServiceIds.length}
      />

      {/* 2. Middle Column: Sidebar (Chats/Services List) */}
      <section
        className={`${
          mobileView === 'LIST' ? 'flex' : 'hidden md:flex'
        } flex-col w-full md:w-[380px] lg:w-[420px] border-r shrink-0 h-full relative z-10 ${bgSidebar}`}
      >
        <SidebarHeader
          isDarkMode={isDarkMode}
          soundEnabled={soundEnabled}
          runningCount={runningServiceIds.length}
          onToggleSound={toggleSound}
          onSelectWelcome={() => setActiveServiceId(null)}
          onOpenSettings={() => setIsSettingsDrawerOpen(true)}
          onOpenAuth={() => handleOpenAuth('LOGIN')}
          isAuthenticated={isAuthenticated}
          userName={user?.name}
          onLogout={() => {
            logout();
            toast.info('Logged out');
          }}
        />

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
          runningServiceIds={runningServiceIds}
          serviceMessages={serviceMessages}
          activeFilterChip={activeFilterChip}
          isDarkMode={isDarkMode}
        />
      </section>

      {/* 3. Right Main Area: Active Service Chat Window OR Welcome Screen */}
      <main
        className={`${
          mobileView === 'CHAT' ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 h-full relative z-0 min-w-0`}
      >
        {activeService ? (
          <>
            <ChatHeader
              activeService={activeService}
              activeOrder={activeOrder}
              onBackMobile={() => setMobileView('LIST')}
              onBackToWelcome={() => setActiveServiceId(null)}
              onOpenBooking={handleOpenBooking}
              onStartCall={(type) => {
                if (!isAuthenticated) {
                  toast.info('Please log in with your phone number to start a consultation call.');
                  handleOpenAuth('LOGIN');
                  return;
                }
                setCallType(type);
                setIsCallingModalOpen(true);
              }}
              onClearChat={() => {
                if (activeServiceId) handleClearChat(activeServiceId);
              }}
              isSaved={activeService ? isServiceSaved(activeService.id) : false}
              onToggleSave={
                activeService
                  ? () => {
                      if (!isAuthenticated) {
                        toast.info('Please log in with your phone number to save services.');
                        handleOpenAuth('LOGIN');
                        return;
                      }
                      toggleSaveService(activeService.id);
                    }
                  : undefined
              }
              onOpenDetails={() => setIsServiceDetailsOpen(true)}
              isDarkMode={isDarkMode}
            />

            {/* Active Order Banner: Shows live status & quick completion action */}
            {activeOrder && activeOrder.status === 'IN_PROGRESS' && activeOrderMessageId && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2 flex items-center justify-between text-xs z-10 shrink-0 select-text">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
                    Order #{activeOrder.orderId} • In Progress
                  </span>
                  <span className="hidden sm:inline text-amber-700 dark:text-amber-400">
                    ({activeOrder.scheduleTime} • {activeOrder.address})
                  </span>
                </div>
                <button
                  onClick={() => handleCompleteOrder(activeOrderMessageId, activeOrder.orderId)}
                  className="shrink-0 ml-2 px-3 py-1 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold rounded-full text-xs shadow-xs cursor-pointer transition-colors"
                >
                  Complete Order
                </button>
              </div>
            )}

            <ChatMessages
              activeService={activeService}
              messages={currentMessages}
              onOpenBooking={handleOpenBooking}
              onReact={handleReactToMessage}
              onCompleteOrder={handleCompleteOrder}
              messagesEndRef={messagesEndRef}
              isDarkMode={isDarkMode}
            />

            <ChatComposer
              inputText={inputText}
              onInputChange={setInputText}
              onSendMessage={() => handleSendMessage(isAuthenticated, () => handleOpenAuth('LOGIN'))}
              onSendVoiceNote={() => handleSendVoiceNote(isAuthenticated, () => handleOpenAuth('LOGIN'))}
              onOpenBooking={handleOpenBooking}
              isAuthenticated={isAuthenticated}
              onOpenAuth={() => handleOpenAuth('LOGIN')}
              isDarkMode={isDarkMode}
            />
          </>
        ) : (
          <WelcomeScreen
            isAuthenticated={isAuthenticated}
            user={user}
            activeRole={activeRole}
            onOpenAuth={(mode = 'LOGIN') => handleOpenAuth(mode)}
            onOpenSettings={() => setIsSettingsDrawerOpen(true)}
            onLogout={() => {
              logout();
              toast.info('Logged out');
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={activeService}
        runningOrder={activeServiceRunningOrder}
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
            () => handleOpenAuth('LOGIN'),
            () => setIsBookingModalOpen(false)
          )
        }
        isDarkMode={isDarkMode}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        isDarkMode={isDarkMode}
      />

      <CallingModal
        isOpen={isCallingModalOpen}
        onClose={() => setIsCallingModalOpen(false)}
        service={activeService}
        callType={callType}
        isDarkMode={isDarkMode}
      />

      <StatusViewerModal
        isOpen={isStatusViewerOpen}
        onClose={() => setIsStatusViewerOpen(false)}
        stories={STATUS_STORIES}
      />

      <SettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={() => setIsSettingsDrawerOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        user={user}
        activeRole={activeRole}
        onSwitchRole={setRole}
        onOpenAuth={() => handleOpenAuth('LOGIN')}
        onLogout={() => {
          logout();
          toast.info('Logged out');
        }}
      />

      <CreateFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        services={dbServices}
        onCreateFilter={createCustomFilter}
        isDarkMode={isDarkMode}
      />

      {/* 4. Slide-in Service Details Drawer on the Right */}
      <ServiceDetailsDrawer
        isOpen={isServiceDetailsOpen}
        onClose={() => setIsServiceDetailsOpen(false)}
        service={activeService}
        isSaved={activeService ? isServiceSaved(activeService.id) : false}
        onToggleSave={() => {
          if (!activeService) return;
          if (!isAuthenticated) {
            toast.info('Please log in with your phone number to save services.');
            handleOpenAuth('LOGIN');
            return;
          }
          toggleSaveService(activeService.id);
        }}
        onOpenBooking={handleOpenBooking}
        onStartCall={(type) => {
          if (!isAuthenticated) {
            toast.info('Please log in with your phone number to start a consultation call.');
            handleOpenAuth('LOGIN');
            return;
          }
          setCallType(type);
          setIsCallingModalOpen(true);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
