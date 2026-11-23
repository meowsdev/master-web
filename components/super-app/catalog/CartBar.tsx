'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingCart01Icon } from '@hugeicons/core-free-icons';
import { cartLineAmount, useCartStore } from '@/store/useCartStore';
import { useTapToSchedule } from '@/components/modals/catalog/ScheduleDialogHost';
import { formatTaka } from '@/components/modals/place-order/format-taka';

interface CartBarProps {
  mainServiceId: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

/* Sticky bar under the Services grid while this main service's cart holds something: "3 items · ৳1,250  Place Order". */
export function CartBar({ mainServiceId, onRequireAuth }: CartBarProps) {
  const lines = useCartStore((state) => state.carts[mainServiceId]);
  // Same as Tap to Schedule: the calendar first, then the order confirmation.
  const tapToSchedule = useTapToSchedule(onRequireAuth);
  if (!lines || lines.length === 0) return null;

  const itemCount = lines.reduce((sum, line) => sum + (line.priceUnit === 'FIXED' ? 1 : line.quantity), 0);
  const total = lines.reduce((sum, line) => sum + cartLineAmount(line), 0);

  return (
    <div className="flex shrink-0 items-center justify-between gap-[12px] border-t border-line bg-white px-[16px] py-[10px] md:px-[24px]">
      <div className="flex min-w-0 items-center gap-[10px]">
        <span className="relative flex size-[36px] items-center justify-center rounded-full bg-secondary text-primary">
          <HugeiconsIcon icon={ShoppingCart01Icon} size={20} />
          <span className="absolute -right-[4px] -top-[4px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-[4px] text-[11px] font-bold text-white">
            {itemCount}
          </span>
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] text-muted">{lines.map((line) => line.subServiceName).join(', ')}</p>
          <p className="text-[16px] font-semibold text-ink">{formatTaka(total)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => tapToSchedule(mainServiceId)}
        className="shrink-0 cursor-pointer rounded-[8px] bg-primary px-[18px] py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90"
      >
        Tap to Schedule
      </button>
    </div>
  );
}
