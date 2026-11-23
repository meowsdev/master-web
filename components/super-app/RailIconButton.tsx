'use client';

import { ReactNode } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';

/**
 * The look of one rail icon (Hugeicons). Selected: a secondary-green circle with a white border around it.
 * Not selected: no circle, just the icon, which darkens on hover.
 */
export const railIconClass = (isActive: boolean) =>
  `relative flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
    isActive ? 'border-white bg-secondary text-ink shadow-[0_1px_4px_rgba(32,41,57,0.12)]' : 'border-transparent bg-transparent text-muted hover:text-ink'
  }`;

interface RailIconButtonProps {
  icon: IconSvgElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** A dot or count drawn on the corner. */
  badge?: ReactNode;
}

/* One icon of the left rail, the same for every role. */
export function RailIconButton({ icon, label, isActive, onClick, disabled = false, badge }: RailIconButtonProps) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} aria-current={isActive ? 'page' : undefined} className={railIconClass(isActive)}>
      <HugeiconsIcon icon={icon} size={22} strokeWidth={isActive ? 2 : 1.7} />
      {badge}
    </button>
  );
}
