'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { AppStoreBadge, GooglePlayBadge } from '@/components/super-app/StoreBadges';
import {
  HEADER_BAR_HEIGHT_CLASS,
  SIDE_PANEL_BLOCKING_OVERLAY_CLASS,
  SIDE_PANEL_CLASS,
  SIDE_PANEL_OVERLAY_CLASS,
} from '@/components/modals/side-panel';

interface SidePanelShellProps {
  title: string;
  /** Omit to make the panel impossible to dismiss (sign-up not finished yet). */
  onClose?: () => void;
  children: ReactNode;
  /**
   * false (default): everything outside the panel keeps working (AGENTS.md §9).
   * true: clicks outside are caught, so a half-filled sign-up can't be abandoned.
   */
  blockOutside?: boolean;
  /** The App Store / Google Play badges at the bottom: only on the public panels (sign-in, service info), not on work panels. */
  showStoreBadges?: boolean;
}

/*
 * The right-hand panel frame shared by the sign-in and service-details panels
 * (Figma: 570px wide, 65px header with ✕ + title, store badges at the bottom of the public panels).
 * There is no click-outside-to-close: only the ✕ closes it.
 */
export function SidePanelShell({ title, onClose, children, blockOutside = false, showStoreBadges = false }: SidePanelShellProps) {
  return (
    <div className={blockOutside ? SIDE_PANEL_BLOCKING_OVERLAY_CLASS : SIDE_PANEL_OVERLAY_CLASS}>
      <aside
        role="dialog"
        aria-label={title}
        className={`auth-drawer-slide-in flex h-full ${SIDE_PANEL_CLASS} flex-col border-l border-[#e5e5e5] bg-white`}
        style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
      >
        <header className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center gap-[12px] border-b border-[#e5e5e5] p-[20px]`}>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close" className="size-[24px] cursor-pointer">
              <Image src="/auth/close.svg" alt="" width={24} height={24} />
            </button>
          )}
          <h3 className="truncate text-[18px] font-semibold tracking-[-0.36px] text-[#202939]">{title}</h3>
        </header>

        <div className="flex flex-1 flex-col justify-between gap-[32px] overflow-y-auto p-[20px]">
          <div>{children}</div>

          {showStoreBadges && (
            <div className="flex flex-wrap items-start justify-end gap-[23px]">
              <AppStoreBadge />
              <GooglePlayBadge />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
