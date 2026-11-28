'use client';

import { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import { HeaderOptionsMenu, HeaderMenuItem } from './HeaderOptionsMenu';

interface ConversationHeaderProps {
  /** Usually an avatar; the caller decides what the picture is. */
  picture: ReactNode;
  title: string;
  /** "5.0", or "New" before the first rating. */
  ratingLabel: string;
  backLabel: string;
  onBack: () => void;
  onOpenTitle?: () => void;
  menuItems: HeaderMenuItem[];
  isDarkMode?: boolean;
  /** In place of the ⋮ menu (shown only when there are menu items), e.g. an order's status box. */
  trailing?: ReactNode;
}

/* The Figma chat header: back arrow (phones), picture, title, star rating and the ⋮ menu. Shared by service and order chats. */
export function ConversationHeader({ picture, title, ratingLabel, backLabel, onBack, onOpenTitle, menuItems, isDarkMode = false, trailing }: ConversationHeaderProps) {
  return (
    <header
      className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-between gap-[12px] border-b px-[16px] ${
        isDarkMode ? 'border-[#222e35] bg-[#202c33]' : 'border-line bg-white'
      }`}
    >
      <div className="flex min-w-0 items-center gap-[10px]">
        <button type="button" onClick={onBack} aria-label={backLabel} className="cursor-pointer md:hidden">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} className="text-ink" />
        </button>

        <button type="button" onClick={onOpenTitle} className="flex min-w-0 cursor-pointer items-center gap-[10px] text-left">
          {picture}
          <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{title}</span>
          <span className="flex shrink-0 items-center gap-[3px] text-[13px] font-semibold text-ink">
            <HugeiconsIcon icon={StarIcon} size={13} className="shrink-0 fill-[#f5a524] text-[#f5a524]" />
            {ratingLabel}
          </span>
        </button>
      </div>

      {trailing}
      {menuItems.length > 0 && <HeaderOptionsMenu items={menuItems} />}
    </header>
  );
}
