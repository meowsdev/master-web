'use client';

import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Service } from '@/types/service.types';
import { HeaderOptionsMenu } from './HeaderOptionsMenu';

interface ChatHeaderProps {
  activeService: Service;
  onBackMobile: () => void;
  onBackToWelcome: () => void;
  onOpenBooking: () => void;
  onClearChat: () => void;
  onOpenDetails?: () => void;
  isDarkMode: boolean;
}

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/*
 * Header of an open service (Figma): profile picture, service name, star rating and the ⋮ menu.
 * Booking is no longer a header button; it lives in the Place Order card and the ⋮ menu.
 */
export function ChatHeader({ activeService, onBackMobile, onBackToWelcome, onOpenBooking, onClearChat, onOpenDetails, isDarkMode }: ChatHeaderProps) {
  const profileSource = activeService.imageUrl || activeService.category?.iconUrl || null;
  const averageRating = activeService.providerSummary?.averageRating ?? null;

  return (
    <header
      className={`flex h-[56px] shrink-0 items-center justify-between gap-[12px] border-b px-[16px] ${
        isDarkMode ? 'border-[#222e35] bg-[#202c33]' : 'border-[#e5e5e5] bg-white'
      }`}
    >
      <div className="flex min-w-0 items-center gap-[10px]">
        <button type="button" onClick={onBackMobile} aria-label="Back to services" className="cursor-pointer md:hidden">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} className="text-[#202939]" />
        </button>

        <button type="button" onClick={onOpenDetails} title="Service details" className="flex min-w-0 cursor-pointer items-center gap-[10px] text-left">
          <span className="flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a9e5cf] text-[18px]">
            {profileSource && isImageSource(profileSource) ? (
              // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
              <img src={profileSource} alt="" className="size-full object-cover" />
            ) : (
              <span aria-hidden>{profileSource || '🛠️'}</span>
            )}
          </span>
          <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{activeService.name}</span>
          <span className="flex shrink-0 items-center gap-[3px] text-[13px] font-semibold text-[#202939]">
            <Image src="/chat-list/star.svg" alt="" width={12} height={11.4} />
            {averageRating !== null ? averageRating.toFixed(1) : 'New'}
          </span>
        </button>
      </div>

      <HeaderOptionsMenu
        items={[
          { label: 'Service info', onSelect: () => onOpenDetails?.() },
          { label: 'Place Order', onSelect: onOpenBooking },
          { label: 'Close chat', onSelect: onBackToWelcome },
        ]}
      />
    </header>
  );
}
