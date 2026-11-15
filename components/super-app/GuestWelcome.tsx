'use client';

import { useRef } from 'react';
import { useFitScale } from '@/hooks/useFitScale';
import { MobileAppPromoCard } from './MobileAppPromoCard';
import { QrLoginCard } from './QrLoginCard';

interface GuestWelcomeProps {
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
}

// Figma card geometry: two 500px cards with a 48px gap, or one 500px card when stacked.
const CARD_SIZE = 500;
const CARD_GAP = 48;
const ROW_WIDTH = CARD_SIZE * 2 + CARD_GAP;
// Side by side only at full Figma size; anywhere narrower the cards stack (and only
// shrink once a single 500px card no longer fits), so text is never scaled down needlessly.
const MIN_ROW_SCALE = 1;

/*
 * Logged-out landing canvas, built from the Figma welcome frame.
 * Colors (#1daa61, #697586, #f7f5f3, #e5e5e5) are that design's own tokens and
 * intentionally differ from the WhatsApp chat palette; Manrope comes from
 * the --font-manrope variable registered in app/layout.tsx.
 */
export function GuestWelcome({ onOpenAuth }: GuestWelcomeProps) {
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { scale, isRow, isMeasured } = useFitScale(contentAreaRef, {
    rowWidth: ROW_WIDTH,
    columnWidth: CARD_SIZE,
    minRowScale: MIN_ROW_SCALE,
  });

  return (
    <div
      className="flex min-w-0 flex-1 flex-col overflow-auto"
      style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
    >
      <header className="flex shrink-0 items-center justify-end gap-[10px] border-b border-[#e5e5e5] bg-white px-[16px] py-[9px] lg:px-[48px]">
        <button
          type="button"
          className="cursor-pointer rounded-[12px] bg-white whitespace-nowrap px-[12px] py-[8px] text-[14px] font-semibold tracking-[-0.4px] text-[#697586] lg:px-[16px] lg:text-[16px] xl:text-[20px]"
        >
          Apply Partner
        </button>
        <button
          type="button"
          onClick={() => onOpenAuth('REGISTER')}
          className="cursor-pointer rounded-[12px] border border-[#1daa61] bg-white whitespace-nowrap px-[12px] py-[8px] text-[14px] font-semibold tracking-[-0.4px] text-[#1daa61] lg:px-[16px] lg:text-[16px] xl:text-[20px]"
        >
          Create New Account
        </button>
      </header>

      {/* Measured box: its width minus padding is what the cards may use. */}
      <div ref={contentAreaRef} className="flex flex-1 bg-[#f7f5f3] p-[24px] sm:p-[48px]">
        {/*
          `zoom` shrinks the fixed-pixel Figma cards while keeping layout size in sync
          (unlike transform). `m-auto` centers the content yet keeps it reachable
          when it is taller than the viewport.
        */}
        <div
          className={`m-auto flex items-center justify-center transition-opacity duration-150 ${
            isRow ? 'flex-row' : 'flex-col'
          } ${isMeasured ? 'opacity-100' : 'opacity-0'}`}
          style={{ gap: CARD_GAP, zoom: scale }}
        >
          <MobileAppPromoCard />
          <QrLoginCard onOtpLogin={() => onOpenAuth('LOGIN')} />
        </div>
      </div>
    </div>
  );
}
