'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
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
  /** Lighter text after the title, e.g. "( 3 Options available)". */
  titleNote?: string;
  /** Pinned under the scrolling body, e.g. the Tap to Schedule button. */
  footer?: ReactNode;
  /** Pinned to the header's right edge, e.g. the profile's Log out. */
  headerAction?: ReactNode;
}

/*
 * The right-hand panel frame shared by the sign-in and service-details panels
 * (Figma: 570px wide, 65px header with ✕ + title, store badges at the bottom of the public panels).
 * There is no click-outside-to-close: only the ✕ closes it.
 */
export function SidePanelShell({ title, onClose, children, blockOutside = false, showStoreBadges = false, titleNote, footer, headerAction }: SidePanelShellProps) {
  return (
    <div className={blockOutside ? SIDE_PANEL_BLOCKING_OVERLAY_CLASS : SIDE_PANEL_OVERLAY_CLASS}>
      <aside
        role="dialog"
        aria-label={title}
        className={`auth-drawer-slide-in flex h-full ${SIDE_PANEL_CLASS} flex-col border-l border-line bg-white`}
        style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
      >
        <header className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center gap-[12px] border-b border-line p-[20px]`}>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close" className="flex size-[32px] cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface">
              <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.8} />
            </button>
          )}
          <h3 className="truncate text-[18px] font-semibold tracking-[-0.36px] text-ink">
            {title}
            {titleNote && <span className="font-normal text-muted"> {titleNote}</span>}
          </h3>
          {headerAction && <div className="ml-auto shrink-0">{headerAction}</div>}
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
        {/* Pinned below the scrolling body: scrolling never hides it. */}
        {footer && <div className="shrink-0 border-t border-line bg-white px-[20px] pb-[20px] pt-[14px] shadow-[0_-8px_20px_rgba(32,41,57,0.05)]">{footer}</div>}
      </aside>
    </div>
  );
}
