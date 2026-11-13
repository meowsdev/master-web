'use client';

import React from 'react';
import { Search, X, UserPlus, Shield, CheckCircle2, Clock, RotateCcw, AlertTriangle } from 'lucide-react';
import { CounselorTab, CounselorChatItem } from '@/types/counselor.types';
import { CounselorListItem } from './CounselorListItem';

interface CounselorChatListProps {
  items: CounselorChatItem[];
  isLoading: boolean;
  activeTab: CounselorTab;
  onSelectTab: (tab: CounselorTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedChatId: string | null;
  onSelectChat: (item: CounselorChatItem) => void;
  tabCounts: {
    public: number;
    ongoing: number;
    hold: number;
    completed: number;
  };
  isOnline: boolean;
  onToggleOnline: () => void;
  onOpenAddCustomer: () => void;
  isDarkMode: boolean;
}

export function CounselorChatList({
  items,
  isLoading,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  selectedChatId,
  onSelectChat,
  tabCounts,
  isOnline,
  onToggleOnline,
  onOpenAddCustomer,
  isDarkMode,
}: CounselorChatListProps) {
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgSearch = isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';

  const tabs: { key: CounselorTab; label: string; count: number }[] = [
    { key: 'PUBLIC', label: 'Public', count: tabCounts.public },
    { key: 'ONGOING', label: 'Ongoing', count: tabCounts.ongoing },
    { key: 'HOLD', label: 'Hold', count: tabCounts.hold },
    { key: 'COMPLETED', label: 'Completed', count: tabCounts.completed },
  ];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden">
      {/* 1. Counselor Duty Status & Flow B Quick Action */}
      <div className="px-3.5 py-2 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-emerald-500/5 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleOnline}
            className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
              isOnline ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-gray-400'
            }`}
            title="Toggle Counselor Duty Status"
          />
          <span className={`text-xs font-bold ${textPrimary}`}>
            {isOnline ? 'Duty Active (Online)' : 'Duty Paused (Offline)'}
          </span>
        </div>

        {/* Flow B Action: Add Customer / Start Chat */}
        <button
          type="button"
          onClick={onOpenAddCustomer}
          className="px-2.5 py-1 rounded-full bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Customer (Flow B)</span>
        </button>
      </div>

      {/* 2. WhatsApp Search Pill */}
      <div className="p-2 border-b border-black/5 dark:border-white/10">
        <div className={`flex items-center px-3 py-1.5 rounded-lg ${bgSearch}`}>
          <Search className={`w-4 h-4 mr-2 ${textSecondary}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customer, order #, or phone..."
            className={`w-full text-xs bg-transparent focus:outline-hidden ${textPrimary}`}
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearchChange('')} className="p-0.5 cursor-pointer">
              <X className={`w-3.5 h-3.5 ${textSecondary}`} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Four WhatsApp Web Filter Pills (ideya/councelor.md FR-TAB) */}
      <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-black/5 dark:border-white/10 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectTab(tab.key)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#d9fdd3] dark:bg-[#005c4b]/80 text-[#008069] dark:text-[#25D366] border border-[#25D366]/40 shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-[#54656f] dark:text-[#8696a0] hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-[#008069] text-white dark:bg-[#25D366] dark:text-[#111b21]'
                      : 'bg-black/10 dark:bg-white/15'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Chat List Scroll Container */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#008069] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-xs ${textSecondary}`}>Loading counselor workspace...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center space-y-2 select-none">
            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-400 flex items-center justify-center text-xl mx-auto">
              {activeTab === 'PUBLIC' && '📢'}
              {activeTab === 'ONGOING' && '⚡'}
              {activeTab === 'HOLD' && '🛡️'}
              {activeTab === 'COMPLETED' && '🎉'}
            </div>
            <h5 className={`text-xs font-bold ${textPrimary}`}>
              {activeTab === 'PUBLIC' && 'No Unassigned Customer Requests'}
              {activeTab === 'ONGOING' && 'No Ongoing Chats Currently'}
              {activeTab === 'HOLD' && 'No Cases in Hold / Dispute'}
              {activeTab === 'COMPLETED' && 'No Completed Orders in History'}
            </h5>
            <p className={`text-[11px] max-w-[220px] mx-auto leading-relaxed ${textSecondary}`}>
              {activeTab === 'PUBLIC' && 'New customer inquiries and broadcast leads will appear here.'}
              {activeTab === 'ONGOING' && 'Active live chats, field works, and warranty revisions show here.'}
              {activeTab === 'HOLD' && '1-3 star negative reviews, disputes, and suspended partners are isolated here.'}
              {activeTab === 'COMPLETED' && 'Successfully executed orders and closed chats are logged here.'}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <CounselorListItem
              key={item.id}
              item={item}
              isSelected={selectedChatId === item.id}
              onSelect={() => onSelectChat(item)}
              isDarkMode={isDarkMode}
            />
          ))
        )}
      </div>
    </div>
  );
}
