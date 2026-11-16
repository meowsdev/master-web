'use client';

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Service } from '@/types/service.types';
import { ChatMessage, OrderCardData } from '@/types/super-app.types';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatComposer } from './ChatComposer';
import { PlaceOrderEmptyState } from './PlaceOrderEmptyState';
import { OrderTabsBar } from './order-chat/OrderTabsBar';
import { OrderChatPanel } from './order-chat/OrderChatPanel';
import { useCustomerOrderTabs } from '@/hooks/useCustomerOrderTabs';

interface CustomerChatCanvasProps {
  activeService: Service;
  activeServiceId: string;
  activeOrder: OrderCardData | null;
  activeOrderMessageId: string | null;
  currentMessages: ChatMessage[];
  inputText: string;
  onInputChange: (text: string) => void;
  onBackMobile: () => void;
  onBackToWelcome: () => void;
  onOpenBooking: () => void;
  onClearChat: (serviceId: string) => void;
  onOpenDetails: () => void;
  onCompleteOrder: (messageId: string, orderId: string) => Promise<void> | void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onSendMessage: () => void;
  onSendVoiceNote: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onOpenOrders?: () => void;
  onPayAdvance?: (messageId: string, orderId: string, amount: number) => void;
  onAcceptPrice?: (messageId: string, orderId: string) => void;
  onRejectPrice?: (messageId: string, orderId: string) => void;
  onSatisfactionResponse?: (messageId: string, orderId: string, continueWith: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isDarkMode: boolean;
  userId?: string;
  /** null = General Chat tab */
  selectedOrderId: string | null;
  onSelectOrderTab: (orderId: string | null) => void;
}

export function CustomerChatCanvas({
  activeService,
  activeServiceId,
  activeOrder,
  activeOrderMessageId,
  currentMessages,
  inputText,
  onInputChange,
  onBackMobile,
  onBackToWelcome,
  onOpenBooking,
  onClearChat,
  onOpenDetails,
  onCompleteOrder,
  onReactToMessage,
  onSendMessage,
  onSendVoiceNote,
  isAuthenticated,
  onOpenAuth,
  onOpenOrders,
  onPayAdvance,
  onAcceptPrice,
  onRejectPrice,
  onSatisfactionResponse,
  messagesEndRef,
  isDarkMode,
  userId,
  selectedOrderId,
  onSelectOrderTab,
}: CustomerChatCanvasProps) {
  const [isCompletingBanner, setIsCompletingBanner] = useState(false);
  const orderTabs = useCustomerOrderTabs(userId, activeService.categoryId);
  const selectedOrder = orderTabs.find((order) => order.id === selectedOrderId);
  // Orders live in their own tabs now, so General Chat only shows plain conversation.
  const generalMessages = currentMessages.filter((message) => message.type !== 'order_card');
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

      {isAuthenticated && <OrderTabsBar orders={orderTabs} selectedOrderId={selectedOrder?.id ?? null} onSelect={onSelectOrderTab} />}

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
            className="shrink-0 ml-2 px-3 py-1 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold rounded-full text-xs shadow-xs cursor-pointer transition-colors disabled:opacity-60 flex items-center gap-1.5"
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
            className="px-3 py-1 bg-[#008069] hover:bg-[#00705c] text-white font-bold rounded-full text-xs cursor-pointer shadow-xs"
          >
            Manage Orders & Revision
          </button>
        </div>
      )} */}

      {selectedOrder && userId ? (
        <OrderChatPanel order={selectedOrder} userId={userId} onOpenOrders={onOpenOrders} />
      ) : (
        <>
          {generalMessages.length === 0 && isAuthenticated ? (
            <PlaceOrderEmptyState onPlaceOrder={onOpenBooking} />
          ) : (
      <ChatMessages
        activeService={activeService}
        messages={generalMessages}
        onOpenBooking={onOpenBooking}
        onReact={onReactToMessage}
        onCompleteOrder={onCompleteOrder}
        onOpenOrders={onOpenOrders}
        onPayAdvance={onPayAdvance}
        onAcceptPrice={onAcceptPrice}
        onRejectPrice={onRejectPrice}
        onSatisfactionResponse={onSatisfactionResponse}
        messagesEndRef={messagesEndRef}
        isDarkMode={isDarkMode}
      />

          )}

      <ChatComposer
        inputText={inputText}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        onSendVoiceNote={onSendVoiceNote}
        onOpenBooking={onOpenBooking}
        isAuthenticated={isAuthenticated}
        onOpenAuth={onOpenAuth}
        isDarkMode={isDarkMode}
      />
        </>
      )}
    </>
  );
}
