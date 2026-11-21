import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { Order } from '@/types/order.types';

const RATING_STEPS = [1, 2, 3, 4, 5];

const TITLE = {
  CUSTOMER: 'সার্ভিস প্রদানকারী আপনাকে রেটিং দিয়েছেন',
  ADMIN: 'প্রোভাইডার কাস্টমারকে রেটিং দিয়েছেন',
} as const;

/*
 * The provider's (or technician's) rating of the customer, read-only. The customer sees what was said
 * about them and the admin sees it on the order; the provider side rates through CustomerRatingCard.
 */
export function CustomerRatingNote({ order, viewer }: { order: Order; viewer: keyof typeof TITLE }) {
  const given = order.customerRating;
  if (!given) return null;

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-gradient-to-b from-white to-[#eefaf5] p-[16px] text-[#202939]">
      <h3 className="text-[13px] font-semibold">{TITLE[viewer]}</h3>

      <div aria-label={`${given.rating} out of 5`} className="mt-[10px] flex justify-center gap-[6px]">
        {RATING_STEPS.map((step) => (
          <HugeiconsIcon key={step} icon={StarIcon} size={26} className={step <= given.rating ? 'text-[#f5a524]' : 'text-[#cecece]'} fill={step <= given.rating ? 'currentColor' : 'none'} />
        ))}
      </div>

      {given.comment && (
        <p className="mt-[18px] flex items-start gap-[10px]">
          <span className="flex h-[22px] shrink-0 items-center">
            <HugeiconsIcon icon={Comment01Icon} size={18} />
          </span>
          <span className="min-w-0 flex-1 text-[14px] font-medium">{given.comment}</span>
        </p>
      )}
    </article>
  );
}
