'use client';

import React from 'react';
import { RailTab } from '@/types/super-app.types';
import { Service } from '@/types/service.types';
import { Order, OrderStatus } from '@/types/order.types';
import { User } from '@/types/auth.types';
import { ChatMessage, OrderCardData } from '@/types/super-app.types';
import { SIDE_PANEL_RESERVE_CLASS } from '@/components/modals/side-panel';
import { ProviderOrderWorkspace } from './provider/ProviderOrderWorkspace';
import { ChatEmptyHeader } from './ChatEmptyHeader';
import { AdminCanvas } from './admin/AdminCanvas';
import { MemberSupportCanvas } from './support/MemberSupportCanvas';
import { TechnicianCanvas } from './technician/TechnicianCanvas';
import { CustomerOrdersCanvas } from './order-history/CustomerOrdersCanvas';
import { CustomerChatCanvas } from './CustomerChatCanvas';
import { WelcomeScreen } from './WelcomeScreen';
import { isStaffRole } from '@/lib/roles';

interface MainCanvasAreaProps {
  activeRailTab: RailTab;
  /** A right-hand panel is open: the chat leaves room for it. */
  isSidePanelOpen: boolean;
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
  handleOpenBooking: () => void;
  handleStartCall: (type: 'voice' | 'video') => void;
  handleClearChat: (serviceId: string) => void;
  setIsServiceDetailsOpen: (open: boolean) => void;
  handleCompleteOrder: (msgId: string, orderId: string, realId?: string) => Promise<void> | void;
  isAuthenticated: boolean;
  handleOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  openOrders: () => void;
  onStartNewOrder: () => void;
  /** The open order tab (null = General Chat) and how to change it. */
  selectedOrderId: string | null;
  onSelectOrderTab: (orderId: string | null) => void;
  openSettings: () => void;
  handleLogout: () => void;
  isDarkMode: boolean;
  user: User | null;
  activeRole: string | null;
}

export function MainCanvasArea({
  activeRailTab,
  isSidePanelOpen,
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
  handleOpenBooking,
  handleStartCall,
  handleClearChat,
  setIsServiceDetailsOpen,
  handleCompleteOrder,
  isAuthenticated,
  handleOpenAuth,
  openOrders,
  onStartNewOrder,
  selectedOrderId,
  onSelectOrderTab,
  openSettings,
  handleLogout,
  isDarkMode,
  user,
  activeRole,
}: MainCanvasAreaProps) {
  return (
    <main
      className={`${
        mobileView === 'CHAT' ? 'flex' : 'hidden md:flex'
      } flex-col flex-1 h-full relative z-0 min-w-0 transition-[padding] duration-200 ${isSidePanelOpen ? SIDE_PANEL_RESERVE_CLASS : ''}`}
    >
      {activeRailTab === 'SUPPORT' && user && (activeRole === 'CUSTOMER' || activeRole === 'PROVIDER' || activeRole === 'TECHNICIAN') ? (
        /* 1a. Provider/customer: direct chat with the platform's support staff */
        <MemberSupportCanvas userId={user.id} onBack={() => setMobileView('LIST')} />
      ) : activeRole === 'TECHNICIAN' && user ? (
        /* 1c. Technician: the job they opened and nothing else */
        <TechnicianCanvas userId={user.id} onBack={() => setMobileView('LIST')} onSwitchAccount={openSettings} onStartCall={handleStartCall} />
      ) : isStaffRole(activeRole) && user ? (
        /* 1b. Staff: one order's full picture and chat, or the empty landing canvas; tabs by permission */
        <AdminCanvas userId={user.id} activeRailTab={activeRailTab} onBack={() => setMobileView('LIST')} onSwitchAccount={openSettings} />
      ) : isProvider && activeProviderOrder && user ? (
        /* 2. Provider Order Workspace: full order info + live chat with the customer */
        <ProviderOrderWorkspace
          order={activeProviderOrder}
          userId={user.id}
          onBack={() => setMobileView('LIST')}
          onUpdateStatus={handleUpdateStatus}
          isUpdatingStatus={isUpdatingStatus}
          onStartCall={handleStartCall}
        />
      ) : isProvider ? (
        /* 2a. Provider landing: nothing open yet, just the header with Switch Account */
        <>
          <ChatEmptyHeader onSwitchAccount={openSettings} menuItems={[]} />
          <div className="flex-1 bg-[#f7f5f3]" />
        </>
      ) : activeRailTab === 'ORDERS' && !isProvider && user ? (
        /* 3a. Customer Orders view: one order's full chat history */
        <CustomerOrdersCanvas userId={user.id} onBackMobile={() => setMobileView('LIST')} onOpenOrdersDrawer={openOrders} />
      ) : !isProvider && activeService && activeServiceId ? (
        /* 3. Customer Service Chat Canvas */
        <CustomerChatCanvas
          activeService={activeService}
          activeServiceId={activeServiceId}
          activeOrder={activeOrder}
          activeOrderMessageId={activeOrderMessageId}
          onBackMobile={() => setMobileView('LIST')}
          onBackToWelcome={() => setActiveServiceId(null)}
          onOpenBooking={handleOpenBooking}
          onClearChat={handleClearChat}
          onOpenDetails={() => setIsServiceDetailsOpen(true)}
          onCompleteOrder={async (msgId, oId) => {
            // Find the real UUID if available in the messages
            const msg = currentMessages.find((m) => m.id === msgId);
            const realId = msg?.orderCard?.id || (oId.length > 20 ? oId : undefined);
            const displayOrderId = msg?.orderCard?.orderId || oId;
            await handleCompleteOrder(msgId, displayOrderId, realId);
          }}
          isAuthenticated={isAuthenticated}
          onOpenOrders={openOrders}
          isDarkMode={isDarkMode}
          userId={user?.id}
          selectedOrderId={selectedOrderId}
          onSelectOrderTab={onSelectOrderTab}
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
          onStartNewOrder={onStartNewOrder}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
        />
      )}
    </main>
  );
}
