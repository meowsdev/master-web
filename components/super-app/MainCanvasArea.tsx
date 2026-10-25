'use client';

import React from 'react';
import { RailTab } from '@/types/super-app.types';
import { Service } from '@/types/service.types';
import { Order, OrderStatus } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { ChatMessage, OrderCardData } from '@/types/super-app.types';
import { ProviderOrderCanvas } from './ProviderOrderCanvas';
import { CustomerChatCanvas } from './CustomerChatCanvas';
import { WelcomeScreen } from './WelcomeScreen';
import { ProviderDirectory, ProviderItem } from './ProviderDirectory';

interface MainCanvasAreaProps {
  activeRailTab: RailTab;
  mobileView: 'LIST' | 'CHAT';
  setMobileView: (view: 'LIST' | 'CHAT') => void;
  // Provider states
  isProvider: boolean;
  activeProviderOrder: Order | null;
  handleUpdateStatus: (status: OrderStatus) => Promise<void>;
  isUpdatingStatus: boolean;
  // Customer states
  activeService: Service | null;
  activeServiceId: string | null;
  setActiveServiceId: (id: string | null) => void;
  activeOrder: OrderCardData | null;
  activeOrderMessageId: string | null;
  currentMessages: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  handleOpenBooking: () => void;
  handleStartCall: (type: 'voice' | 'video') => void;
  handleClearChat: (serviceId: string) => void;
  isServiceSaved: (id: string) => boolean;
  handleToggleSave: () => void;
  setIsServiceDetailsOpen: (open: boolean) => void;
  handleCompleteOrder: (msgId: string, orderId: string) => void;
  handleReactToMessage: (msgId: string, emoji: string) => void;
  handleSendMessage: (isAuth: boolean, onAuth: () => void) => void;
  handleSendVoiceNote: (isAuth: boolean, onAuth: () => void) => void;
  isAuthenticated: boolean;
  handleOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  openOrders: () => void;
  openSettings: () => void;
  handleLogout: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isDarkMode: boolean;
  user: User | null;
  activeRole: string | null;
  runningServiceIds: string[];
  dbServices: Service[];
  handleSelectService: (service: Service) => void;
  setActiveRailTab: (tab: RailTab) => void;
  // Order negotiation handlers
  handlePayAdvance?: (messageId: string, orderId: string, amount: number) => void;
  handleAcceptPrice?: (messageId: string, orderId: string) => void;
  handleRejectPrice?: (messageId: string, orderId: string) => void;
  handleSatisfactionResponse?: (messageId: string, orderId: string, continueWith: boolean) => void;
}

export function MainCanvasArea({
  activeRailTab,
  mobileView,
  setMobileView,
  isProvider,
  activeProviderOrder,
  handleUpdateStatus,
  isUpdatingStatus,
  activeService,
  activeServiceId,
  setActiveServiceId,
  activeOrder,
  activeOrderMessageId,
  currentMessages,
  inputText,
  setInputText,
  handleOpenBooking,
  handleStartCall,
  handleClearChat,
  isServiceSaved,
  handleToggleSave,
  setIsServiceDetailsOpen,
  handleCompleteOrder,
  handleReactToMessage,
  handleSendMessage,
  handleSendVoiceNote,
  isAuthenticated,
  handleOpenAuth,
  openOrders,
  openSettings,
  handleLogout,
  messagesEndRef,
  isDarkMode,
  user,
  activeRole,
  runningServiceIds,
  dbServices,
  handleSelectService,
  setActiveRailTab,
  handlePayAdvance,
  handleAcceptPrice,
  handleRejectPrice,
  handleSatisfactionResponse,
}: MainCanvasAreaProps) {
  return (
    <main
      className={`${
        mobileView === 'CHAT' ? 'flex' : 'hidden md:flex'
      } flex-col flex-1 h-full relative z-0 min-w-0`}
    >
      {/* 1. Global Provider Directory (When PROVIDERS Rail Tab is selected) */}
      {activeRailTab === 'PROVIDERS' ? (
        <ProviderDirectory
          onSelectProviderChat={(provider: ProviderItem, serviceName: string) => {
            const matchingService =
              dbServices.find((s) => s.name.toLowerCase().includes(serviceName.toLowerCase())) ||
              dbServices[0];
            if (matchingService) {
              handleSelectService(matchingService);
              setActiveRailTab('CHATS');
              setMobileView('CHAT');
            }
          }}
          activeConnectedProviderName={activeService ? 'Super App Verified Partner' : null}
          hasRunningOrder={runningServiceIds.length > 0}
          isDarkMode={isDarkMode}
        />
      ) : isProvider && activeProviderOrder ? (
        /* 2. Provider Order Workspace */
        <ProviderOrderCanvas
          order={activeProviderOrder}
          onBack={() => setMobileView('LIST')}
          onUpdateStatus={handleUpdateStatus}
          isUpdatingStatus={isUpdatingStatus}
          onStartCall={handleStartCall}
          isDarkMode={isDarkMode}
        />
      ) : !isProvider && activeService && activeServiceId ? (
        /* 3. Customer Service Chat Canvas */
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
          onPayAdvance={handlePayAdvance}
          onAcceptPrice={handleAcceptPrice}
          onRejectPrice={handleRejectPrice}
          onSatisfactionResponse={handleSatisfactionResponse}
          messagesEndRef={messagesEndRef}
          isDarkMode={isDarkMode}
        />
      ) : (
        /* 4. WhatsApp Web Default Welcome Screen */
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
  );
}
