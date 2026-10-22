'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { Service } from '@/types/service.types';
import {
  ChatMessage,
  RailTab,
  STATUS_STORIES,
  DHAKA_AREAS,
  PaymentMode,
} from '@/types/super-app.types';

// Custom Hooks
import { useServicesFilter } from '@/hooks/useServicesFilter';
import { useSuperAppAudio } from '@/hooks/useSuperAppAudio';

// Super App UI Components
import { NavigationRail } from '@/components/super-app/NavigationRail';
import { SidebarHeader } from '@/components/super-app/SidebarHeader';
import { SearchAndFilters } from '@/components/super-app/SearchAndFilters';
import { ServiceList } from '@/components/super-app/ServiceList';
import { ChatHeader } from '@/components/super-app/ChatHeader';
import { ChatMessages } from '@/components/super-app/ChatMessages';
import { ChatComposer } from '@/components/super-app/ChatComposer';
import { WelcomeScreen } from '@/components/super-app/WelcomeScreen';

// Dialogs & Drawers
import { BookingModal } from '@/components/modals/BookingModal';
import { AuthModal } from '@/components/modals/AuthModal';
import { CallingModal } from '@/components/modals/CallingModal';
import { StatusViewerModal } from '@/components/modals/StatusViewerModal';
import { SettingsDrawer } from '@/components/modals/SettingsDrawer';
import { CreateFilterModal } from '@/components/modals/CreateFilterModal';

export default function SuperAppPage() {
  const { user, isAuthenticated, activeRole, logout, setRole } = useAuthStore();

  // Theme & Sound states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSuperAppAudio(soundEnabled);

  // Far-left Rail Tab & Active Service state
  const [activeRailTab, setActiveRailTab] = useState<RailTab>('CHATS');
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  // In-chat messages mapped per service ID
  const [serviceMessages, setServiceMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');

  // Mobile navigation view: 'LIST' or 'CHAT'
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('CHAT');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingAddress, setBookingAddress] = useState(DHAKA_AREAS[0]);
  const [bookingTime, setBookingTime] = useState('Today, Within 2 Hours');
  const [bookingPaymentMode, setBookingPaymentMode] = useState<PaymentMode>('CASH');

  // Calling & Status viewer modals
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

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
  } = useServicesFilter();

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Handle service selection & conversation initiation
  const handleSelectService = (service: Service) => {
    setActiveServiceId(service.id);
    setMobileView('CHAT');

    if (!serviceMessages[service.id] || serviceMessages[service.id].length === 0) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initialMsgs: ChatMessage[] = [
        {
          id: 'init-1',
          sender: 'them',
          text: `Assalamu Alaikum! Welcome to ${service.name}. I am your dedicated service counselor.`,
          time: currentTime,
        },
        {
          id: 'init-2',
          sender: 'them',
          text: service.description || 'Here are the details for this verified on-demand service:',
          time: currentTime,
          type: 'service_card',
          serviceCard: {
            title: service.name,
            price: service.basePrice,
            duration: `${service.durationMin || 45} mins`,
            category: service.category?.name || 'On-Demand Service',
          },
        },
      ];
      setServiceMessages((prev) => ({ ...prev, [service.id]: initialMsgs }));
    }
  };

  // Send message inside active chat
  const handleSendMessage = () => {
    if (!inputText.trim() || !activeServiceId) return;
    const msgText = inputText.trim();
    const sId = activeServiceId;
    setInputText('');
    playSound('send');

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'me',
      text: msgText,
      time: currentTime,
      status: 'read',
    };

    setServiceMessages((prev) => ({
      ...prev,
      [sId]: [...(prev[sId] || []), newMsg],
    }));

    // Simulated counselor reply after 1.2s
    setTimeout(() => {
      playSound('receive');
      const counselorReply: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'them',
        text: `Got your message regarding "${msgText}". Our certified technician is on standby. Click [Book Service] whenever you are ready!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setServiceMessages((prev) => ({
        ...prev,
        [sId]: [...(prev[sId] || []), counselorReply],
      }));
    }, 1200);
  };

  // Send simulated voice note
  const handleSendVoiceNote = () => {
    if (!activeServiceId) return;
    const sId = activeServiceId;
    playSound('send');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const voiceMsg: ChatMessage = {
      id: 'vmsg-' + Date.now(),
      sender: 'me',
      text: '🎙️ Voice note (0:14)',
      time: currentTime,
      status: 'read',
    };
    setServiceMessages((prev) => ({
      ...prev,
      [sId]: [...(prev[sId] || []), voiceMsg],
    }));
    toast.success('Voice message sent');
  };

  // React to message with emoji
  const handleReactToMessage = (messageId: string, emoji: string) => {
    if (!activeServiceId) return;
    setServiceMessages((prev) => ({
      ...prev,
      [activeServiceId]: (prev[activeServiceId] || []).map((m) =>
        m.id === messageId ? { ...m, reaction: emoji } : m
      ),
    }));
  };

  // Confirm in-chat booking
  const handleConfirmBooking = () => {
    if (!activeService || !activeServiceId) return;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const confirmationMsg: ChatMessage = {
      id: 'book-' + Date.now(),
      sender: 'them',
      text: `🎉 Booking Confirmed!\n\n📍 Location: ${bookingAddress}\n⏰ Scheduled: ${bookingTime}\n💳 Payment Mode: ${bookingPaymentMode}\n💰 Base Fare: ৳${activeService.basePrice}\n\nOur verified technician is preparing tools for dispatch!`,
      time: currentTime,
    };

    setServiceMessages((prev) => ({
      ...prev,
      [activeServiceId]: [...(prev[activeServiceId] || []), confirmationMsg],
    }));

    setIsBookingModalOpen(false);
    playSound('receive');
    toast.success(`Booked ${activeService.name} successfully!`);
  };

  const bgMain = isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]';
  const bgSidebar = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';

  return (
    <div className={`flex h-screen w-screen overflow-hidden select-none font-sans ${bgMain}`}>
      {/* 1. Far-Left Navigation Rail (60px) */}
      <NavigationRail
        activeRailTab={activeRailTab}
        onSelectTab={setActiveRailTab}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={() => setIsSettingsDrawerOpen(true)}
        onOpenStatus={() => setIsStatusViewerOpen(true)}
        user={user}
        activeRole={activeRole}
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
          onToggleSound={() => {
            setSoundEnabled(!soundEnabled);
            toast.info(`Sound: ${!soundEnabled ? 'ON' : 'OFF'}`);
          }}
          onSelectWelcome={() => setActiveServiceId(null)}
          onOpenSettings={() => setIsSettingsDrawerOpen(true)}
          onOpenAuth={() => {
            setAuthInitialMode('LOGIN');
            setIsAuthModalOpen(true);
          }}
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
          onOpenCreateFilter={() => setIsFilterModalOpen(true)}
          onDeleteCustomFilter={deleteCustomFilter}
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
          onOpenAuth={() => {
            setAuthInitialMode('LOGIN');
            setIsAuthModalOpen(true);
          }}
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
              onBackMobile={() => setMobileView('LIST')}
              onBackToWelcome={() => setActiveServiceId(null)}
              onOpenBooking={() => setIsBookingModalOpen(true)}
              onStartCall={(type) => {
                setCallType(type);
                setIsCallingModalOpen(true);
              }}
              onClearChat={() => {
                if (activeServiceId) {
                  setServiceMessages((prev) => ({ ...prev, [activeServiceId]: [] }));
                  toast.success('Chat cleared');
                }
              }}
              isSaved={activeService ? isServiceSaved(activeService.id) : false}
              onToggleSave={activeService ? () => toggleSaveService(activeService.id) : undefined}
              isDarkMode={isDarkMode}
            />

            <ChatMessages
              activeService={activeService}
              messages={currentMessages}
              onOpenBooking={() => setIsBookingModalOpen(true)}
              onReact={handleReactToMessage}
              messagesEndRef={messagesEndRef}
              isDarkMode={isDarkMode}
            />

            <ChatComposer
              inputText={inputText}
              onInputChange={setInputText}
              onSendMessage={handleSendMessage}
              onSendVoiceNote={handleSendVoiceNote}
              onOpenBooking={() => setIsBookingModalOpen(true)}
              isDarkMode={isDarkMode}
            />
          </>
        ) : (
          <WelcomeScreen
            isAuthenticated={isAuthenticated}
            user={user}
            activeRole={activeRole}
            onOpenAuth={(mode = 'LOGIN') => {
              setAuthInitialMode(mode);
              setIsAuthModalOpen(true);
            }}
            onOpenSettings={() => setIsSettingsDrawerOpen(true)}
            onLogout={() => {
              logout();
              toast.info('Logged out');
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* 4. Modals and Drawers */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={activeService}
        bookingAddress={bookingAddress}
        onAddressChange={setBookingAddress}
        bookingTime={bookingTime}
        onTimeChange={setBookingTime}
        bookingPaymentMode={bookingPaymentMode}
        onPaymentModeChange={setBookingPaymentMode}
        onConfirmBooking={handleConfirmBooking}
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
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled(!soundEnabled);
          toast.info(`Sound: ${!soundEnabled ? 'ON' : 'OFF'}`);
        }}
        user={user}
        activeRole={activeRole}
        onSwitchRole={setRole}
        onOpenAuth={() => {
          setAuthInitialMode('LOGIN');
          setIsAuthModalOpen(true);
        }}
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
    </div>
  );
}
