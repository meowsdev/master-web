'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Service } from '@/types/service.types';
import { OrderCardData } from '@/types/super-app.types';
import { ChatHeader } from './ChatHeader';
import { OrderTabsBar, SERVICES_TAB } from './order-chat/OrderTabsBar';
import { ServicesTab } from './catalog/ServicesTab';
import { OrderChatPanel } from './order-chat/OrderChatPanel';
import { useCustomerOrderTabs } from '@/hooks/useCustomerOrderTabs';

interface CustomerChatCanvasProps {
  activeService: Service;
  activeServiceId: string;
  activeOrder: OrderCardData | null;
  activeOrderMessageId: string | null;
  onBackMobile: () => void;
  onBackToWelcome: () => void;
  onOpenBooking: () => void;
  onClearChat: (serviceId: string) => void;
  onOpenDetails: () => void;
  onCompleteOrder: (messageId: string, orderId: string) => Promise<void> | void;
  isAuthenticated: boolean;
  onOpenOrders?: () => void;
  isDarkMode: boolean;
  userId?: string;
  /** The open order tab; null until the customer picks one (the newest is shown meanwhile). */
  selectedOrderId: string | null;
  onSelectOrderTab: (orderId: string | null) => void;
  /** Guests: ordering from the Services tab asks them to log in first. */
  onRequireAuth: () => void;
}

export function CustomerChatCanvas({
  activeService,
  activeServiceId,
  activeOrder,
  activeOrderMessageId,
  onBackMobile,
  onBackToWelcome,
  onOpenBooking,
  onClearChat,
  onOpenDetails,
  onCompleteOrder,
  isAuthenticated,
  onOpenOrders,
  isDarkMode,
  userId,
  selectedOrderId,
  onSelectOrderTab,
  onRequireAuth,
}: CustomerChatCanvasProps) {
  const [isCompletingBanner, setIsCompletingBanner] = useState(false);
  const orderTabs = useCustomerOrderTabs(userId, activeService.categoryId);
  // With no tab picked yet, the newest running order opens; with none running, the Services tab (the sub-service
  // cards). A picked order that has since closed falls back the same way.
  const pickedOrder = orderTabs.find((order) => order.id === selectedOrderId);
  const selectedOrder = selectedOrderId === SERVICES_TAB ? undefined : (pickedOrder ?? orderTabs[orderTabs.length - 1]);
  const selectedTab = selectedOrder?.id ?? SERVICES_TAB;
  return (
    <>
      <ChatHeader
        activeService={activeService}
        onBackMobile={onBackMobile}
        onBackToWelcome={onBackToWelcome}
        onOpenBooking={onOpenBooking}
        onClearChat={() => onClearChat(activeServiceId)}
        onOpenDetails={onOpenDetails}
        isDarkMode={isDarkMode}
      />

      {isAuthenticated && orderTabs.length > 0 && <OrderTabsBar orders={orderTabs} selectedTab={selectedTab} onSelect={onSelectOrderTab} />}

      {/* Active Order Banner: Shows live status & quick completion action */}
      {activeOrder && (activeOrder.status === 'IN_PROGRESS' || activeOrder.status === 'PENDING' || activeOrder.status === 'ACCEPTED') && activeOrderMessageId && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2 flex items-center justify-between text-xs z-10 shrink-0 select-text">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
              Order #{activeOrder.orderId} • {activeOrder.hasActiveRevision ? 'Revision Running ⚠️' : 'Running ⚡'}
            </span>
            <span className="hidden sm:inline text-amber-700 dark:text-amber-400">
              ({activeOrder.scheduleTime} • {activeOrder.address})
            </span>
          </div>
          <button
            onClick={async () => {
              if (isCompletingBanner) return;
              setIsCompletingBanner(true);
              try {
                await onCompleteOrder(activeOrderMessageId, activeOrder.orderId);
              } finally {
                setIsCompletingBanner(false);
              }
            }}
            disabled={isCompletingBanner}
            className="shrink-0 ml-2 px-3 py-1 bg-primary hover:bg-primary dark:bg-[#38C792] dark:hover:bg-[#38C792] text-white dark:text-[#111b21] font-bold rounded-full text-xs shadow-xs cursor-pointer transition-colors disabled:bg-primary-disabled flex items-center gap-1.5"
          >
            {isCompletingBanner ? (
              <>
                <Clock className="w-3 h-3 animate-spin" />
                <span>Completing...</span>
              </>
            ) : (
              'Complete Order'
            )}
          </button>
        </div>
      )}

      {/* Fallback Banner for Active Revisions if no Order Card is present in chat */}
      {/* {!activeOrder && activeService && (
        <div className="bg-amber-100 dark:bg-amber-950/60 border-b border-amber-300 dark:border-amber-700 px-4 py-2 flex items-center justify-between text-xs z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold text-amber-900 dark:text-amber-200">
              ⚠️ Service Revision / Active Order in progress
            </span>
          </div>
          <button
            onClick={() => {
              // If there's no order card yet, let user open orders drawer or create/complete
              if (onOpenOrders) onOpenOrders();
            }}
            className="px-3 py-1 bg-primary hover:bg-primary text-white font-bold rounded-full text-xs cursor-pointer shadow-xs"
          >
            Manage Orders & Revision
          </button>
        </div>
      )} */}

      {selectedOrder && userId ? (
        <OrderChatPanel key={selectedOrder.id} order={selectedOrder} userId={userId} onOpenOrders={onOpenOrders} />
      ) : (
        <ServicesTab mainServiceId={activeService.categoryId} isAuthenticated={isAuthenticated} onRequireAuth={onRequireAuth} />
      )}
    </>
  );
}
