'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { SidePanelShell } from '@/components/modals/SidePanelShell';

interface AuthDrawerShellProps {
  title: string;
  /** Omit to make the panel impossible to dismiss (sign-up not finished yet). */
  onClose?: () => void;
  children: ReactNode;
  /** Replaces the grey camera circle, e.g. with the user's photo picker in edit mode. */
  avatar?: ReactNode;
  /** Catch clicks outside the panel. Only for an unfinished sign-up (see side-panel.ts). */
  blockOutside?: boolean;
}

/* Sign-in / profile panel: the shared side-panel frame plus the Figma avatar circle on top. */
export function AuthDrawerShell({ title, onClose, children, avatar, blockOutside }: AuthDrawerShellProps) {
  return (
    <SidePanelShell title={title} onClose={onClose} blockOutside={blockOutside} showStoreBadges>
      <div className="flex flex-col items-center gap-[64px]">
        {avatar ?? <Image src="/auth/avatar-placeholder.svg" alt="" width={120} height={120} className="shrink-0" />}
        <div className="flex w-full flex-col items-center gap-[48px]">{children}</div>
      </div>
    </SidePanelShell>
  );
}

interface AuthPrimaryButtonProps {
  children: ReactNode;
  disabled?: boolean;
  /** Defaults to "submit" (form steps); use "button" for plain click actions. */
  type?: 'submit' | 'button';
  onClick?: () => void;
}

/* Green action button of the Figma panels; shown at 50% until the form is ready. */
export function AuthPrimaryButton({ children, disabled, type = 'submit', onClick }: AuthPrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer rounded-[12px] bg-primary px-[16px] py-[8px] text-[20px] font-semibold tracking-[-0.4px] text-white transition-opacity hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
    >
      {children}
    </button>
  );
}

export const authLinkClass =
  'cursor-pointer text-[14px] font-semibold text-primary hover:underline';
