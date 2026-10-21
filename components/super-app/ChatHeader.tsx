'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Wrench,
  ChevronDown,
  Video,
  Phone,
  Search,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { Service } from '@/types/service.types';

interface ChatHeaderProps {
  activeService: Service;
  onBackMobile: () => void;
  onBackToWelcome: () => void;
  onOpenBooking: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onClearChat: () => void;
  isDarkMode: boolean;
}

export function ChatHeader({
  activeService,
  onBackMobile,
  onBackToWelcome,
  onOpenBooking,
  onStartCall,
  onClearChat,
  isDarkMode,
}: ChatHeaderProps) {
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);

  const bgHeader = isDarkMode ? 'bg-[#202c33] border-[#222e35] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]';
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const headerIconBtn = isDarkMode
    ? 'text-[#aebac1] hover:text-white hover:bg-white/10'
    : 'text-[#54656f] hover:text-[#111b21] hover:bg-black/5';

  return (
    <div className={`h-[60px] border-b px-4 flex items-center justify-between shrink-0 ${bgHeader}`}>
      {/* Left: Contact / Service Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          onClick={onBackMobile}
          className={`md:hidden p-1.5 rounded-full cursor-pointer transition-colors ${headerIconBtn}`}
          title="Back to Services"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Back to Welcome Screen */}
        <button
          onClick={onBackToWelcome}
          className={`hidden md:flex p-1.5 rounded-full cursor-pointer transition-colors ${headerIconBtn}`}
          title="Back to Welcome Screen"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Service Avatar with WhatsApp Green Indicator */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center text-lg shrink-0 border border-[#e9edef] dark:border-[#374248]">
            {activeService.category?.iconUrl || '🛠️'}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-white dark:border-[#202c33]" />
        </div>

        {/* Title & Counselor Online */}
        <div className="min-w-0">
          <h2 className={`text-[15.5px] font-medium truncate leading-tight ${textPrimary}`}>
            {activeService.name}
          </h2>
          <p className={`text-[12px] ${textSecondary} font-normal flex items-center gap-1.5`}>
            <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
            <span>Counselor Online • ৳{activeService.basePrice}</span>
          </p>
        </div>
      </div>

      {/* Right Action Buttons in Authentic WhatsApp Web Desktop Style */}
      <div className="flex items-center gap-1">
        {/* Book Service Button (WhatsApp Web pill button style) */}
        <button
          onClick={onOpenBooking}
          className="border border-[#d1d7db] dark:border-[#3b4a54] bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] text-[12.5px] font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942] transition-colors cursor-pointer mr-1"
        >
          <Wrench className="w-3.5 h-3.5 text-[#008069] dark:text-[#25D366]" />
          <span>Book Service</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#54656f] dark:text-[#8696a0]" />
        </button>

        {/* Video Call */}
        <button
          onClick={() => onStartCall('video')}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
          title="Video call"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Voice Call */}
        <button
          onClick={() => onStartCall('voice')}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
          title="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Search Inside Chat */}
        <button
          onClick={() => toast.info('Search inside service messages')}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
          title="Search chat"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Chat Menu */}
        <div className="relative">
          <button
            onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
            title="Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isChatMenuOpen && (
            <div
              className={`absolute right-0 top-11 w-48 rounded-xl shadow-xl py-2 border z-50 text-sm ${
                isDarkMode ? 'bg-[#233138] border-[#2f3b43] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
              }`}
            >
              <button
                onClick={() => {
                  onOpenBooking();
                  setIsChatMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 text-[#008069] dark:text-[#25D366] font-bold cursor-pointer"
              >
                Book Service Now
              </button>
              <button
                onClick={() => {
                  onClearChat();
                  setIsChatMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-rose-500/10 text-rose-500 cursor-pointer"
              >
                Clear messages
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
