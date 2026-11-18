'use client';

import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import Image from 'next/image';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Store01Icon, UserGroupIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { OrderPanelKind, useOrderPanelStore } from '@/store/useOrderPanelStore';
import { RailSelection, RailTab } from '@/types/super-app.types';

interface AdminNavigationRailProps {
  selection: RailSelection;
  onSelectTab: (tab: RailTab) => void;
  profilePhoto?: string | null;
  onOpenAccount: () => void;
}

const MANAGEMENT_TABS: Array<{ kind: OrderPanelKind; title: string; icon: IconSvgElement }> = [
  { kind: 'adminTechnicians', title: 'Technicians', icon: UserGroupIcon },
  { kind: 'adminProviders', title: 'Providers', icon: Store01Icon },
];

/* The admin's rail: logo, Messages (all orders), Services (a tab), then Technicians and Providers (panels), profile at the bottom. */
export function AdminNavigationRail({ selection, onSelectTab, profilePhoto, onOpenAccount }: AdminNavigationRailProps) {
  const openKind = useOrderPanelStore((state) => state.kind);
  const openPanel = useOrderPanelStore((state) => state.open);
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

        {MANAGEMENT_TABS.map((tab) => {
          const isOpen = openKind === tab.kind;
          return (
            <button
              key={tab.kind}
              type="button"
              onClick={() => (isOpen ? closePanel() : openPanel(null, tab.kind))}
              title={tab.title}
              aria-label={tab.title}
              aria-pressed={isOpen}
              className={`flex size-[36px] cursor-pointer items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-[#d7fdd2] text-[#1daa61]' : 'bg-white text-[#202939] hover:bg-[#ebe8e4]'}`}
            >
              <HugeiconsIcon icon={tab.icon} size={18} />
            </button>
          );
        })}
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
