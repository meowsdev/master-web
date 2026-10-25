'use client';

import React from 'react';
import { Calendar, CheckCheck } from 'lucide-react';
import { Service } from '@/types/service.types';
import { ChatMessage } from '@/types/super-app.types';
import { OrderCard } from './OrderCard';

interface ChatMessagesProps {
  activeService: Service;
  messages: ChatMessage[];
  onOpenBooking: () => void;
  onReact: (messageId: string, emoji: string) => void;
  onCompleteOrder?: (messageId: string, orderId: string) => void;
  onOpenOrders?: () => void;
  onPayAdvance?: (messageId: string, orderId: string, amount: number) => void;
  onAcceptPrice?: (messageId: string, orderId: string) => void;
  onRejectPrice?: (messageId: string, orderId: string) => void;
  onSatisfactionResponse?: (messageId: string, orderId: string, continueWith: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isDarkMode: boolean;
}

export function ChatMessages({
  activeService,
  messages,
  onOpenBooking,
  onReact,
  onCompleteOrder,
  onOpenOrders,
  onPayAdvance,
  onAcceptPrice,
  onRejectPrice,
  onSatisfactionResponse,
  messagesEndRef,
  isDarkMode,
}: ChatMessagesProps) {
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bubbleIncoming = isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const bubbleOutgoing = isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]';

  return (
    <div
      className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-16 py-4 whatsapp-wallpaper space-y-2.5"
      style={{
        backgroundColor: isDarkMode ? '#0b141a' : '#efeae2',
        filter: isDarkMode ? 'brightness(0.88)' : 'none',
      }}
    >
      {/* Date Divider Pill */}
      <div className="flex justify-center my-3">
        <span
          className={`text-[12px] font-medium px-3.5 py-1 rounded-md shadow-xs ${
            isDarkMode ? 'bg-[#182229] text-[#8696a0]' : 'bg-white/95 text-[#54656f]'
          }`}
        >
          Today
        </span>
      </div>

      {/* Messages List */}
      {messages.map((msg) => (
        <React.Fragment key={msg.id}>
          {msg.type === 'order_card' && msg.orderCard ? (
            /* Interactive Order Status Card */
            <OrderCard
              msg={msg}
              onCompleteOrder={onCompleteOrder || (() => {})}
              onOpenOrders={onOpenOrders}
              onPayAdvance={onPayAdvance}
              onAcceptPrice={onAcceptPrice}
              onRejectPrice={onRejectPrice}
              onSatisfactionResponse={onSatisfactionResponse}
              isDarkMode={isDarkMode}
            />
          ) : msg.type === 'service_card' && msg.serviceCard ? (
            /* Service Attachment Card */
            <div className="flex justify-start my-2">
              <div
                className={`rounded-2xl p-4 shadow-md max-w-sm w-full space-y-3 border ${
                  isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl ${
                      isDarkMode ? 'bg-[#005c4b]/50 text-white' : 'bg-[#e7fce3] text-[#075E54]'
                    }`}
                  >
                    {activeService.category?.iconUrl || '🛠️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-[15px] font-bold leading-snug ${textPrimary}`}>
                      {msg.serviceCard.title}
                    </h3>
                    <p className={`text-[12px] mt-0.5 ${textSecondary}`}>
                      Estimated duration: {msg.serviceCard.duration}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl flex items-center justify-between ${
                    isDarkMode ? 'bg-[#111b21]' : 'bg-[#f0f2f5]'
                  }`}
                >
                  <div>
                    <span className={`text-[11px] ${textSecondary}`}>Fixed Base Price</span>
                    <div
                      className={`text-[19px] font-black ${
                        isDarkMode ? 'text-[#25D366]' : 'text-[#075E54]'
                      }`}
                    >
                      ৳{msg.serviceCard.price}
                    </div>
                  </div>
                  <span
                    className={`text-[11.5px] px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${
                      isDarkMode
                        ? 'bg-[#005c4b] text-white'
                        : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30'
                    }`}
                  >
                    Verified Dispatch
                  </span>
                </div>

                <button
                  onClick={onOpenBooking}
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[13px] rounded-xl shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Technician Now</span>
                </button>

                <div className="flex justify-end pt-1">
                  <span className={`text-[11px] ${textSecondary}`}>{msg.time}</span>
                </div>
              </div>
            </div>
          ) : msg.sender === 'me' ? (
            /* Outgoing Message (WhatsApp green bubble) */
            <div className="flex justify-end my-0.5 relative group">
              <div
                className={`rounded-lg rounded-tr-none px-3.5 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] max-w-[85%] sm:max-w-[70%] md:max-w-[60%] text-[14.2px] leading-[19px] relative whitespace-pre-line select-text ${bubbleOutgoing}`}
              >
                <span className="select-text">{msg.text}</span>
                <span className="float-right ml-3 mt-1.5 text-[11px] opacity-75 flex items-center gap-1 select-none">
                  <span>{msg.time}</span>
                  <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                </span>

                {msg.reaction && (
                  <span className="absolute -bottom-2.5 right-2 bg-white dark:bg-[#202c33] rounded-full px-1.5 py-0.5 shadow-sm text-xs border border-black/5 dark:border-white/10 select-none">
                    {msg.reaction}
                  </span>
                )}

                {/* Hover Reaction Bar */}
                <div className="hidden group-hover:flex items-center gap-1 absolute -top-8 right-0 bg-white dark:bg-[#233138] rounded-full px-2 py-1 shadow-lg border border-black/5 dark:border-white/10 text-sm z-10 select-none">
                  {['👍', '❤️', '😂', '🔥', '🙏'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReact(msg.id, emoji)}
                      className="hover:scale-125 transition-transform p-0.5 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Incoming Message (Pure White bubble) */
            <div className="flex justify-start my-0.5 relative group">
              <div
                className={`rounded-lg rounded-tl-none px-3.5 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] max-w-[85%] sm:max-w-[70%] md:max-w-[60%] text-[14.2px] leading-[19px] relative whitespace-pre-line select-text ${bubbleIncoming}`}
              >
                <span className="select-text">{msg.text}</span>
                <span className="float-right ml-3 mt-1.5 text-[11px] opacity-75 select-none">
                  {msg.time}
                </span>

                {msg.reaction && (
                  <span className="absolute -bottom-2.5 left-2 bg-white dark:bg-[#202c33] rounded-full px-1.5 py-0.5 shadow-sm text-xs border border-black/5 dark:border-white/10">
                    {msg.reaction}
                  </span>
                )}

                {/* Hover Reaction Bar */}
                <div className="hidden group-hover:flex items-center gap-1 absolute -top-8 left-0 bg-white dark:bg-[#233138] rounded-full px-2 py-1 shadow-lg border border-black/5 dark:border-white/10 text-sm z-10">
                  {['👍', '❤️', '😂', '🔥', '🙏'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReact(msg.id, emoji)}
                      className="hover:scale-125 transition-transform p-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
