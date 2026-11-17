'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
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
}

/* The Figma chat header: back arrow (phones), picture, title, star rating and the ⋮ menu. Shared by service and order chats. */
export function ConversationHeader({ picture, title, ratingLabel, backLabel, onBack, onOpenTitle, menuItems, isDarkMode = false }: ConversationHeaderProps) {
  return (
    <header
      className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-between gap-[12px] border-b px-[16px] ${
        isDarkMode ? 'border-[#222e35] bg-[#202c33]' : 'border-[#e5e5e5] bg-white'
      }`}
    >
      <div className="flex min-w-0 items-center gap-[10px]">
        <button type="button" onClick={onBack} aria-label={backLabel} className="cursor-pointer md:hidden">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} className="text-[#202939]" />
        </button>

        <button type="button" onClick={onOpenTitle} className="flex min-w-0 cursor-pointer items-center gap-[10px] text-left">
          {picture}
          <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{title}</span>
          <span className="flex shrink-0 items-center gap-[3px] text-[13px] font-semibold text-[#202939]">
            <Image src="/chat-list/star.svg" alt="" width={12} height={11.4} style={{ width: 'auto', height: 'auto' }} />
            {ratingLabel}
          </span>
        </button>
      </div>

      <HeaderOptionsMenu items={menuItems} />
    </header>
  );
}
