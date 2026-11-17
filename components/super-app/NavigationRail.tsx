'use client';

import React from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Award,
  Radio,
  Users,
  Sparkles,
  Star,
  Settings,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { RailSelection, RailTab } from '@/types/super-app.types';
import { User } from '@/types/auth.types';
import { CustomerNavigationRail } from './CustomerNavigationRail';

interface NavigationRailProps {
  /** The selected tab, or ORDERS / ACCOUNT while that right-hand panel is open. */
  activeRailTab: RailSelection;
  onSelectTab: (tab: RailTab) => void;
  isDarkMode: boolean;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenStatus: () => void;
  onOpenOrders?: () => void;
  onStartNewOrder?: () => void;
  user: User | null;
  activeRole: string | null;
  runningCount?: number;
}

export function NavigationRail({
  activeRailTab,
  onSelectTab,
  isDarkMode,
  onOpenSettings,
  onOpenProfile,
  onOpenAuth,
  onOpenStatus,
  onOpenOrders,
  onStartNewOrder,
  user,
  activeRole,
  runningCount = 0,
}: NavigationRailProps) {
  // Guests and customers share the slim Figma rail; staff roles keep the full one.
  const isCustomerView = !activeRole || activeRole === 'CUSTOMER';
  const isProviderView = activeRole === 'PROVIDER';
  if (isCustomerView || isProviderView) {
    return (
      <CustomerNavigationRail
        isAuthenticated={Boolean(user)}
        selection={activeRailTab}
        onSelectTab={onSelectTab}
        onStartNewOrder={isProviderView ? undefined : onStartNewOrder}
        showOrdersTab={!isProviderView}
        profilePhoto={user?.profilePhoto}
        onOpenAccount={user ? onOpenProfile : onOpenAuth}
        runningCount={runningCount}
        accountTitle={user ? `${user.name} (${activeRole})` : 'Profile / Login'}
      />
    );
  }

  // Figma rail: every icon sits in a 36px circle (white idle, mint when active).
  const railButtonClass = (isActive: boolean) =>
    `relative flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
      isActive ? 'bg-[#d7fdd2] text-[#1daa61]' : 'bg-white text-[#202939] hover:bg-[#ebe8e4]'
    }`;
  const statusDotClass = 'absolute right-0 top-0 size-[10px] rounded-full bg-[#1daa61] ring-2 ring-[#f7f5f3]';

  return (
    <aside className="z-20 hidden h-full w-[64px] shrink-0 select-none flex-col items-center justify-between overflow-clip bg-[#f7f5f3] px-[8px] pb-[27px] pt-[16px] md:flex">
      {/* Top Navigation Tabs */}
      <div className="flex flex-col items-center gap-[8px]">
        <Image src="/chat-list/brand-logo.svg" alt="Super App" width={36} height={36} priority className="mb-[8px]" />
        <button
          onClick={() => onSelectTab('CHATS')}
          className={railButtonClass(activeRailTab === 'CHATS')}
          title="Chats & Services"
        >
          <MessageSquare className="w-5 h-5" />
          {runningCount > 0 ? (
            <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-[#f7f5f3] animate-pulse">
              {runningCount}
            </span>
          ) : (
            <span className={statusDotClass} />
          )}
        </button>

        <button
          onClick={() => onSelectTab('PROVIDERS')}
          className={railButtonClass(activeRailTab === 'PROVIDERS')}
          title="Verified Providers Directory"
        >
          <Award className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            onSelectTab('STATUS');
            onOpenStatus();
          }}
          className={railButtonClass(activeRailTab === 'STATUS')}
          title="Status updates"
        >
          <Radio className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            onSelectTab('CHANNELS');
            toast.info('Channels: Super app Service Broadcasts');
          }}
          className={railButtonClass(activeRailTab === 'CHANNELS')}
          title="Channels"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            onSelectTab('COMMUNITIES');
            toast.info('Communities: Dhaka Neighborhood Services');
          }}
          className={railButtonClass(activeRailTab === 'COMMUNITIES')}
          title="Communities"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={() => toast.info('Super app AI Counselor active')}
          className={`${railButtonClass(false)} text-[#1daa61]`}
          title="AI Support Counselor"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-[8px]">
        <button onClick={onOpenOrders} className={railButtonClass(activeRailTab === 'ORDERS')} title="My Orders & History">
          <Package className="w-5 h-5" />
          {runningCount > 0 && <span className={statusDotClass} />}
        </button>

        <button
          onClick={() => toast.info('No starred messages')}
          className={railButtonClass(false)}
          title="Starred"
        >
          <Star className="w-5 h-5" />
          <span className={statusDotClass} />
        </button>

        <button onClick={onOpenSettings} className={railButtonClass(false)} title="Settings & Role">
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={user ? onOpenProfile : onOpenAuth}
          className={`relative flex size-[36px] cursor-pointer items-center justify-center overflow-hidden rounded-full transition-all hover:ring-2 hover:ring-[#1daa61] ${
            activeRailTab === 'ACCOUNT' ? 'bg-[#d7fdd2]' : 'bg-white'
          }`}
          title={user ? `${user.name} (${activeRole})` : 'Profile / Login'}
        >
          {user?.profilePhoto ? (
            <Image src={user.profilePhoto} alt="User" width={36} height={36} unoptimized className="object-cover" />
          ) : (
            <span className="text-xs font-bold text-[#202939]">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
