import { ReactNode } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';

/** One icon + text line of an order card, shared by the customer's and the provider's order cards. */
export function OrderDetailLine({ icon, children }: { icon: IconSvgElement; children: ReactNode }) {
  return (
    <li className="flex items-start gap-[10px] text-[14px] font-medium text-[#202939]">
      <HugeiconsIcon icon={icon} size={18} className="mt-[2px] shrink-0" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}
