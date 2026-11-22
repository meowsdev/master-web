'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingCart01Icon } from '@hugeicons/core-free-icons';
import { cartLineAmount, useCartStore } from '@/store/useCartStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { formatTaka } from '@/components/modals/place-order/format-taka';

interface CartBarProps {
  mainServiceId: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

/* Sticky bar under the Services grid while this main service's cart holds something: "3 items · ৳1,250  Place Order". */
export function CartBar({ mainServiceId, isAuthenticated, onRequireAuth }: CartBarProps) {
  const lines = useCartStore((state) => state.carts[mainServiceId]);
  const openCheckout = useCatalogPanelStore((state) => state.openCheckout);
  if (!lines || lines.length === 0) return null;

  const itemCount = lines.reduce((sum, line) => sum + (line.priceUnit === 'FIXED' ? 1 : line.quantity), 0);
  const total = lines.reduce((sum, line) => sum + cartLineAmount(line), 0);

  return (
    <div className="flex shrink-0 items-center justify-between gap-[12px] border-t border-[#e5e5e5] bg-white px-[16px] py-[10px] md:px-[24px]">
      <div className="flex min-w-0 items-center gap-[10px]">
        <span className="relative flex size-[36px] items-center justify-center rounded-full bg-[#e7fce3] text-[#1daa61]">
          <HugeiconsIcon icon={ShoppingCart01Icon} size={20} />
          <span className="absolute -right-[4px] -top-[4px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#d6336c] px-[4px] text-[11px] font-bold text-white">
            {itemCount}
          </span>
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] text-[#697586]">{lines.map((line) => line.subServiceName).join(', ')}</p>
          <p className="text-[16px] font-semibold text-[#202939]">{formatTaka(total)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => (isAuthenticated ? openCheckout(mainServiceId) : onRequireAuth())}
        className="shrink-0 cursor-pointer rounded-[8px] bg-[#1daa61] px-[18px] py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452]"
      >
        Place Order
      </button>
    </div>
  );
}
