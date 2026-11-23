'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Calendar03Icon, ShoppingCart01Icon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { cartLineAmount, useCartStore } from '@/store/useCartStore';
import { useTapToSchedule } from './ScheduleDialogHost';

/*
 * The one "Tap to Schedule" of a main service: pinned at the bottom of the right-hand panel, so scrolling never hides
 * it. Empty cart: a quiet hint. With items: a green bar with the count, the total and an arrow; it rises in, bumps
 * when the total changes, and a soft shine runs across it so the next step is easy to spot.
 */
export function ScheduleCta({ mainServiceId }: { mainServiceId: string }) {
  const lines = useCartStore((state) => state.carts[mainServiceId]);
  const tapToSchedule = useTapToSchedule();
  const itemCount = (lines ?? []).reduce((sum, line) => sum + (line.priceUnit === 'FIXED' ? 1 : line.quantity), 0);
  const total = (lines ?? []).reduce((sum, line) => sum + cartLineAmount(line), 0);

  if (!lines || lines.length === 0) {
    return (
      <div className="flex h-[56px] items-center justify-center gap-[8px] rounded-[14px] border border-dashed border-secondary bg-secondary text-[14px] font-medium text-muted">
        <HugeiconsIcon icon={Calendar03Icon} size={18} className="text-primary" />
        একটা অপশন Add করুন, তারপর এখানে Schedule করুন
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => tapToSchedule(mainServiceId)}
      className="schedule-cta-rise group relative flex h-[60px] w-full cursor-pointer items-center gap-[12px] overflow-hidden rounded-[14px] bg-primary px-[14px] text-left text-white shadow-[0_8px_20px_rgba(56,199,146,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_12px_26px_rgba(56,199,146,0.45)] active:translate-y-0 active:scale-[0.99]"
    >
      <span aria-hidden className="schedule-cta-shine pointer-events-none absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <span className="relative flex size-[38px] shrink-0 items-center justify-center rounded-full bg-white/20">
        <HugeiconsIcon icon={ShoppingCart01Icon} size={20} strokeWidth={1.8} />
        <span key={itemCount} className="schedule-cta-bump absolute -right-[4px] -top-[4px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-[4px] text-[11px] font-bold text-primary">
          {itemCount}
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-[17px] font-semibold tracking-[-0.3px]">Tap to Schedule</span>
        <span className="truncate text-[12px] font-medium text-white/85">{lines.map((line) => line.variantName).join(', ')}</span>
      </span>

      <span key={total} className="schedule-cta-bump shrink-0 text-[18px] font-bold">
        {formatTaka(total)}
      </span>
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white text-primary transition-transform duration-200 group-hover:translate-x-[3px]">
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2.2} />
      </span>
    </button>
  );
}
