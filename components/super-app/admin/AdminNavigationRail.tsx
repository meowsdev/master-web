'use client';

import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import Image from 'next/image';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Briefcase01Icon, CustomerSupportIcon, UserGroupIcon, UserSharingIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { RailSelection, RailTab } from '@/types/super-app.types';

interface AdminNavigationRailProps {
  selection: RailSelection;
  onSelectTab: (tab: RailTab) => void;
  profilePhoto?: string | null;
  onOpenAccount: () => void;
}

const SUPPORT_CHAT_TABS: Array<{ tab: RailTab; title: string; icon: IconSvgElement }> = [
  { tab: 'SUPPORT_PROVIDERS', title: 'Chat with providers', icon: CustomerSupportIcon },
  { tab: 'SUPPORT_TECHNICIANS', title: 'Technicians', icon: UserGroupIcon },
  { tab: 'SUPPORT_CUSTOMERS', title: 'Chat with customers', icon: UserSharingIcon },
];

/* The staff rail: logo, Messages (all orders), then Services and the member chats when the role may use them, profile at the bottom. */
export function AdminNavigationRail({ selection, onSelectTab, profilePhoto, onOpenAccount }: AdminNavigationRailProps) {
  const { canManageServices, canChatWithMembers, canManageStaff } = useStaffPermissions();
  const isStaffSelected = selection === 'STAFF';
  const openKind = useOrderPanelStore((state) => state.kind);
  const closePanel = useOrderPanelStore((state) => state.close);
  const isMessagesSelected = selection === 'CHATS' && !openKind?.startsWith('admin');
  // The service form is a panel of the Services tab itself, so it keeps the tab highlighted.
  const isServicesSelected = selection === 'SERVICES' && (!openKind?.startsWith('admin') || openKind === 'adminService');

  return (
    <aside className="z-20 hidden h-full w-[64px] shrink-0 select-none flex-col items-center justify-between overflow-clip bg-[#f7f5f3] px-[8px] pb-[27px] md:flex">
      <div className="flex w-[36px] flex-col gap-[8px]">
        <div className={`mb-[5px] flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-center`}>
          <Image src="/chat-list/brand-logo.svg" alt="Super App" width={36} height={36} priority />
        </div>

        <button
          type="button"
          onClick={() => {
            closePanel();
            onSelectTab('CHATS');
          }}
          title="All orders"
          aria-current={isMessagesSelected ? 'page' : undefined}
          className="size-[36px] cursor-pointer"
        >
          <Image src={`/rail/chats-${isMessagesSelected ? 'active' : 'inactive'}.svg`} alt="Messages" width={36} height={36} />
        </button>

        {/* Services: a tab of its own. The list takes the left side and the editor the right. */}
        {canManageServices && (
        <button
          type="button"
          onClick={() => {
            closePanel();
            onSelectTab('SERVICES');
          }}
          title="Services"
          aria-label="Services"
          aria-current={isServicesSelected ? 'page' : undefined}
          className={`flex size-[36px] cursor-pointer items-center justify-center rounded-full transition-colors ${isServicesSelected ? 'bg-[#d7fdd2] text-[#1daa61]' : 'bg-white text-[#202939] hover:bg-[#ebe8e4]'}`}
        >
          <HugeiconsIcon icon={Wrench01Icon} size={18} />
        </button>
        )}

        {/* Direct chat: one icon for providers, one for customers. Each is a tab with its own list. */}
        {canChatWithMembers && SUPPORT_CHAT_TABS.map((tab) => {
          const isSelected = selection === tab.tab;
          return (
            <button
              key={tab.tab}
              type="button"
              onClick={() => {
                closePanel();
                onSelectTab(tab.tab);
              }}
              title={tab.title}
              aria-label={tab.title}
              aria-current={isSelected ? 'page' : undefined}
              className={`flex size-[36px] cursor-pointer items-center justify-center rounded-full transition-colors ${isSelected ? 'bg-[#d7fdd2] text-[#1daa61]' : 'bg-white text-[#202939] hover:bg-[#ebe8e4]'}`}
            >
              <HugeiconsIcon icon={tab.icon} size={18} />
            </button>
          );
        })}

        {/* Staff: office accounts (Manager, Support, HR, Counselor). Admin only. */}
        {canManageStaff && (
          <button
            type="button"
            onClick={() => {
              closePanel();
              onSelectTab('STAFF');
            }}
            title="Staff"
            aria-label="Staff"
            aria-current={isStaffSelected ? 'page' : undefined}
            className={`flex size-[36px] cursor-pointer items-center justify-center rounded-full transition-colors ${isStaffSelected ? 'bg-[#d7fdd2] text-[#1daa61]' : 'bg-white text-[#202939] hover:bg-[#ebe8e4]'}`}
          >
            <HugeiconsIcon icon={Briefcase01Icon} size={18} />
          </button>
        )}
      </div>

      <button type="button" onClick={onOpenAccount} title="Profile" className={`size-[36px] cursor-pointer overflow-hidden rounded-full ${selection === 'ACCOUNT' ? 'ring-2 ring-[#1daa61]' : ''}`}>
        {profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
          <img src={profilePhoto} alt="Account" className="size-full object-cover" />
        ) : (
          <Image src={`/rail/account-${selection === 'ACCOUNT' ? 'active' : 'inactive'}.svg`} alt="Account" width={36} height={36} />
        )}
      </button>
    </aside>
  );
}
