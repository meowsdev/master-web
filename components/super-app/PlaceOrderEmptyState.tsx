'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';

interface PlaceOrderEmptyStateProps {
  onPlaceOrder: () => void;
}

/*
 * What a signed-in customer sees before opening any chat: a blank canvas with one
 * action. The faint white-to-mint gradient is the Figma card fill.
 */
export function PlaceOrderEmptyState({ onPlaceOrder }: PlaceOrderEmptyStateProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center bg-surface">
      <button
        type="button"
        onClick={onPlaceOrder}
        className="flex h-[80px] w-[92px] cursor-pointer flex-col items-center justify-center gap-[6px] rounded-[8px] bg-gradient-to-b from-white to-secondary transition-shadow hover:shadow-md"
      >
        <span className="btn-raised flex size-[36px] items-center justify-center rounded-full bg-primary text-white">
          <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} />
        </span>
        <span className="text-[13px] font-medium text-ink">Place Order</span>
      </button>
    </div>
  );
}
