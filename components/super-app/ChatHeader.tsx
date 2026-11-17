'use client';

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
}

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/*
 * Header of an open service (Figma): profile picture, service name, star rating and the ⋮ menu.
 * Booking is no longer a header button; it lives in the Place Order card and the ⋮ menu.
 */
export function ChatHeader({ activeService, onBackMobile, onBackToWelcome, onOpenBooking, onOpenDetails, isDarkMode }: ChatHeaderProps) {
  const profileSource = activeService.imageUrl || activeService.category?.iconUrl || null;
  const averageRating = activeService.providerSummary?.averageRating ?? null;

  return (
    <ConversationHeader
      isDarkMode={isDarkMode}
      picture={
        <span className="flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a9e5cf] text-[18px]">
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
      menuItems={[
        { label: 'Service info', onSelect: () => onOpenDetails?.() },
        { label: 'Place Order', onSelect: onOpenBooking },
        { label: 'Close chat', onSelect: onBackToWelcome },
      ]}
    />
  );
}
