'use client';

import React from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Radio,
  Users,
  Sparkles,
  Star,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { toast } from 'sonner';
import { RailTab } from '@/types/super-app.types';
import { User } from '@/types/auth.types';

interface NavigationRailProps {
  activeRailTab: RailTab;
  onSelectTab: (tab: RailTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenStatus: () => void;
  user: User | null;
  activeRole: string | null;
  runningCount?: number;
}

export function NavigationRail({
  activeRailTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  onOpenSettings,
  onOpenStatus,
  user,
  activeRole,
  runningCount = 0,
}: NavigationRailProps) {
  const bgRail = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <aside className={`hidden md:flex flex-col items-center justify-between w-[60px] border-r py-3 z-20 shrink-0 select-none ${bgRail}`}>
      {/* Top Navigation Tabs */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Chats Tab with active indicator */}
        <button
          onClick={() => onSelectTab('CHATS')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
            activeRailTab === 'CHATS'
              ? isDarkMode
                ? 'bg-[#374248] text-[#00a884]'
                : 'bg-[#d9fdd3] text-[#008069]'
              : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/10`
          }`}
          title="Chats & Services"
        >
          <MessageSquare className="w-5 h-5" />
          {runningCount > 0 ? (
            <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#202c33] animate-pulse">
              {runningCount}
            </span>
          ) : (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#25D366] rounded-full ring-2 ring-white dark:ring-[#202c33]" />
          )}
        </button>

        {/* Status Updates Tab */}
        <button
          onClick={() => {
            onSelectTab('STATUS');
            onOpenStatus();
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
            activeRailTab === 'STATUS'
              ? isDarkMode
                ? 'bg-[#374248] text-[#00a884]'
                : 'bg-[#d9fdd3] text-[#008069]'
              : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/10`
          }`}
          title="Status updates"
        >
          <Radio className="w-5 h-5" />
        </button>

        {/* Channels Tab */}
        <button
          onClick={() => {
            onSelectTab('CHANNELS');
            toast.info('Channels: Super app Service Broadcasts');
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activeRailTab === 'CHANNELS'
              ? isDarkMode
                ? 'bg-[#374248] text-[#00a884]'
                : 'bg-[#d9fdd3] text-[#008069]'
              : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/10`
          }`}
          title="Channels"
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Communities Tab */}
        <button
          onClick={() => {
            onSelectTab('COMMUNITIES');
            toast.info('Communities: Dhaka Neighborhood Services');
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activeRailTab === 'COMMUNITIES'
              ? isDarkMode
                ? 'bg-[#374248] text-[#00a884]'
                : 'bg-[#d9fdd3] text-[#008069]'
              : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/10`
          }`}
          title="Communities"
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Meta AI / Assistant Tab */}
        <button
          onClick={() => toast.info('Super app AI Counselor active')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#25D366] hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
          title="AI Support Counselor"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Theme Dark/Light Toggle */}
        <button
          onClick={onToggleTheme}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Starred Messages */}
        <button
          onClick={() => toast.info('No starred messages')}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer relative`}
          title="Starred"
        >
          <Star className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#25D366] rounded-full ring-2 ring-[#f0f2f5] dark:ring-[#202c33]" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
          title="Settings & Role"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full overflow-hidden border border-[#d1d7db] dark:border-[#374248] bg-white flex items-center justify-center hover:ring-2 hover:ring-[#25D366] transition-all cursor-pointer relative"
          title={user ? `${user.name} (${activeRole})` : 'Profile / Login'}
        >
          {user?.profilePhoto ? (
            <Image src={user.profilePhoto} alt="User" width={36} height={36} unoptimized className="object-cover" />
          ) : (
            <span className="text-xs font-bold text-[#54656f]">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </span>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border border-white dark:border-[#202c33]" />
        </button>
      </div>
    </aside>
  );
}
