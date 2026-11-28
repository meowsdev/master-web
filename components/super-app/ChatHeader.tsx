'use client';

import { ReactNode } from 'react';
import { Service } from '@/types/service.types';
import { ConversationHeader } from './ConversationHeader';

interface ChatHeaderProps {
  activeService: Service;
  onBackMobile: () => void;
  onBackToWelcome: () => void;
  onOpenBooking: () => void;
  onClearChat: () => void;
  onOpenDetails?: () => void;
  isDarkMode: boolean;
  /** On the right, e.g. the open order tab's status box. */
  trailing?: ReactNode;
}

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/*
 * Header of an open service (Figma): profile picture, service name, star rating and, with an order tab open, its
 * status box. No ⋮ menu, like the provider's and the admin's order headers: the name opens the service info, booking
 * lives in the Place Order card, and the sidebar list switches chats. onBackToWelcome / onOpenBooking stay in the props
 * for the callers but are no longer used here.
 */
export function ChatHeader({ activeService, onBackMobile, onOpenDetails, isDarkMode, trailing }: ChatHeaderProps) {
  const profileSource = activeService.imageUrl || activeService.category?.iconUrl || null;
  const averageRating = activeService.providerSummary?.averageRating ?? null;

  return (
    <ConversationHeader
      isDarkMode={isDarkMode}
      picture={
        <span className="flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[18px]">
          {profileSource && isImageSource(profileSource) ? (
            // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
            <img src={profileSource} alt="" className="size-full object-cover" />
          ) : (
            <span aria-hidden>{profileSource || '🛠️'}</span>
          )}
        </span>
      }
      title={activeService.name}
      ratingLabel={averageRating !== null ? averageRating.toFixed(1) : 'New'}
      backLabel="Back to services"
      onBack={onBackMobile}
      onOpenTitle={onOpenDetails}
      trailing={trailing}
      menuItems={[]}
    />
  );
}
