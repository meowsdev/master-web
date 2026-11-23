'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';

/** One filter chip: selected = secondary fill, not selected = #CECECE border and muted text. */
export const filterChipClass = (isActive: boolean) =>
  `h-[36px] shrink-0 cursor-pointer rounded-[20px] border px-[12px] text-[16px] font-semibold transition-colors ${
    isActive ? 'border-secondary bg-secondary text-ink' : 'border-chip text-muted hover:text-ink'
  }`;

const arrowClass =
  'absolute top-1/2 z-10 flex size-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink shadow-md transition-transform hover:scale-110';

interface ChipRowProps<T extends string> {
  chips: ReadonlyArray<{ id: T; label: string }>;
  activeId: T | null;
  onSelect: (id: T) => void;
  /** For screen readers, e.g. "Categories" or "Service information". */
  label: string;
  /** After the chips, e.g. the staff "Add" chip. */
  trailing?: ReactNode;
  /** Padding of the scrolling row (it scrolls under the arrows). */
  rowClassName?: string;
}

/*
 * The app's row of chips, used for every filter and tab row (sidebar filters, the service tabs Overview · FAQ · How to
 * Order · Review · Details, the staff editor tabs). Too many for the width: the wheel, a drag and the arrows scroll it.
 */
export function ChipRow<T extends string>({ chips, activeId, onSelect, label, trailing, rowClassName = 'px-[16px] py-[12px]' }: ChipRowProps<T>) {
  const { ref, canScrollLeft, canScrollRight, scrollByAmount, wasDragged } = useHorizontalScroll<HTMLDivElement>();

  return (
    <div className="relative">
      {canScrollLeft && (
        <button type="button" aria-label={`Scroll ${label} left`} onClick={() => scrollByAmount(-160)} className={`${arrowClass} left-0`}>
          <ChevronLeft className="size-[16px]" />
        </button>
      )}
      <div ref={ref} role="tablist" aria-label={label} className={`no-scrollbar flex cursor-grab select-none items-center gap-[8px] overflow-x-auto active:cursor-grabbing ${rowClassName}`}>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={activeId === chip.id}
            onClick={() => {
              if (!wasDragged()) onSelect(chip.id);
            }}
            className={filterChipClass(activeId === chip.id)}
          >
            {chip.label}
          </button>
        ))}
        {trailing}
      </div>
      {canScrollRight && (
        <button type="button" aria-label={`Scroll ${label} right`} onClick={() => scrollByAmount(160)} className={`${arrowClass} right-0`}>
          <ChevronRight className="size-[16px]" />
        </button>
      )}
    </div>
  );
}
