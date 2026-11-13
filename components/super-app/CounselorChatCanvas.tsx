'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  UserCheck,
  CreditCard,
  PlusCircle,
  BellRing,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import { CounselorChatItem } from '@/types/counselor.types';
import { ChatMessage } from '@/types/super-app.types';

interface CounselorChatCanvasProps {
  chatItem: CounselorChatItem;
  onBack: () => void;
  onOpenCreateOrder: () => void;
  onOpenModifyPrice: () => void;
  onSendDueReminder: (orderId: string, dueAmount: number, phone: string) => void;
  onHoldProvider: (orderId: string, remarks: string) => void;
  onStartCall: (type: 'voice' | 'video') => void;
  isDarkMode: boolean;
}

export function CounselorChatCanvas({
  chatItem,
  onBack,
  onOpenCreateOrder,
  onOpenModifyPrice,
  onSendDueReminder,
  onHoldProvider,
  onStartCall,
  isDarkMode,
}: CounselorChatCanvasProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'c-init-1',
      sender: 'them',
      text: `Hello, I need assistance regarding ${chatItem.serviceName}.`,
      time: '10:30 AM',
    },
    {
      id: 'c-init-2',
      sender: 'me',
      text: `Assalamu Alaikum! I am your dedicated Master Counselor. How may I assist you with your booking today?`,
      time: '10:31 AM',
      status: 'read',
    },
  ]);
  const [inputVal, setInputVal] = useState('');

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgHeader = isDarkMode ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]';
  const bgCanvas = isDarkMode ? 'bg-[#0b141a]' : 'bg-[#efeae2]';

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const newMsg: ChatMessage = {
      id: 'c-msg-' + Date.now(),
      sender: 'me',
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
  };

  return (
    <div className={`flex flex-col flex-1 h-full min-h-0 relative select-text ${bgCanvas}`}>
      {/* 1. Counselor Chat Header */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between z-10 shrink-0 ${bgHeader}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <ArrowLeft className={`w-5 h-5 ${textPrimary}`} />
          </button>

          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-[#008069] dark:text-[#25D366] flex items-center justify-center font-bold text-lg shrink-0">
            {chatItem.customerName.charAt(0)}
          </div>

          <div className="min-w-0">
            <h3 className={`text-sm font-bold truncate ${textPrimary}`}>
              {chatItem.customerName}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`text-[11px] ${textSecondary}`}>📞 {chatItem.customerPhone}</span>
              <span className={`text-[11px] ${textSecondary}`}>•</span>
              <span className="text-[11px] font-semibold text-[#008069] dark:text-[#25D366] truncate">
                {chatItem.serviceName}
              </span>
            </div>
          </div>
        </div>

        {/* Action icons: Voice Call, Video Call */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStartCall('voice')}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#54656f] dark:text-[#aebac1] cursor-pointer"
            title="Start Counselor Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onStartCall('video')}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#54656f] dark:text-[#aebac1] cursor-pointer"
            title="Start Counselor Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Counselor Action Toolbar (Quick Command Ribbon per ideya/councelor.md) */}
      <div className="px-4 py-2 border-b border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#111b21]/95 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-2xs z-10">
        <button
          type="button"
          onClick={onOpenCreateOrder}
          className="px-3 py-1.5 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Create Order & Advance %</span>
        </button>

        <button
          type="button"
          onClick={onOpenModifyPrice}
          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Edit Price (+Add-on)</span>
        </button>

        {chatItem.dueAmount > 0 && (
          <button
            type="button"
            onClick={() => onSendDueReminder(chatItem.id, chatItem.dueAmount, chatItem.customerPhone)}
            className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Send Due Reminder (৳{chatItem.dueAmount})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onHoldProvider(chatItem.id, 'Counselor manual hold / dispute inspection')}
          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/25 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Hold / Suspend Provider</span>
        </button>
      </div>

      {/* 3. Active Order / Revision Alert Strip */}
      {chatItem.hasActiveRevision && (
        <div className="bg-amber-100 dark:bg-amber-950/70 border-b border-amber-300 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />
            <span className="font-bold">
              3-Day Warranty Revision Active: &ldquo;{chatItem.revisionIssue || 'Customer requested service rework'}&rdquo;
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-bold">
            Flagged for Counselor
          </span>
        </div>
      )}

      {/* 4. Chat Canvas Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <div className="flex justify-center my-2">
          <span className="text-[11px] font-medium px-3 py-1 rounded-md bg-white/80 dark:bg-[#182229] shadow-xs text-gray-500">
            Counselor Consultation Session
          </span>
        </div>

        {messages.map((m) => {
          const isMe = m.sender === 'me';
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-sm sm:max-w-md rounded-2xl px-3.5 py-2 text-xs shadow-xs space-y-1 ${
                  isMe
                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef]'
                    : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef]'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                <div className="flex justify-end gap-1 text-[10px] opacity-70">
                  <span>{m.time}</span>
                  {isMe && <span>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Bottom Counselor Composer */}
      <div className={`p-2.5 border-t flex items-center gap-2 shrink-0 ${bgHeader}`}>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type consultation message to customer..."
          className={`flex-1 py-2 px-3.5 text-xs rounded-xl border focus:outline-hidden ${
            isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-white' : 'bg-white border-[#e9edef] text-black'
          }`}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputVal.trim()}
          className="p-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] text-white dark:text-[#111b21] disabled:opacity-50 cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
