'use client';

import { MobileAppPromoCard } from './MobileAppPromoCard';
import { QrLoginCard } from './QrLoginCard';

interface GuestWelcomeProps {
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
}

/*
 * Logged-out landing canvas, built from the Figma welcome frame.
 * Colors (#1daa61, #697586, #f7f5f3, #e5e5e5) are that design's own tokens and
 * intentionally differ from the WhatsApp chat palette; Manrope comes from
 * the --font-manrope variable registered in app/layout.tsx.
 */
export function GuestWelcome({ onOpenAuth }: GuestWelcomeProps) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col overflow-auto"
      style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
    >
      <header className="flex shrink-0 items-center justify-end gap-[10px] border-b border-[#e5e5e5] bg-white px-[48px] py-[9px]">
        <button
          type="button"
          className="cursor-pointer rounded-[12px] bg-white px-[16px] py-[8px] text-[20px] font-semibold tracking-[-0.4px] text-[#697586]"
        >
          Apply Partner
        </button>
        <button
          type="button"
          onClick={() => onOpenAuth('REGISTER')}
          className="cursor-pointer rounded-[12px] border border-[#1daa61] bg-white px-[16px] py-[8px] text-[20px] font-semibold tracking-[-0.4px] text-[#1daa61]"
        >
          Create New Account
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center gap-[48px] bg-[#f7f5f3] p-[48px]">
        <MobileAppPromoCard />
        <QrLoginCard onOtpLogin={() => onOpenAuth('LOGIN')} />
      </div>
    </div>
  );
}
