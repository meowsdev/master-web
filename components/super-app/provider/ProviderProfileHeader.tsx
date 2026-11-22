'use client';

import { useState } from 'react';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useProviderWallet } from '@/hooks/useProviderWallet';
import { User } from '@/types/auth.types';
import { MyRatingButton } from '../reviews/MyRatingButton';
import { ProviderPayDueDialog } from './ProviderPayDueDialog';
import { TeamButton } from './team/TeamButton';

/*
 * The provider's header in the sidebar: photo, name, rating, and what they owe the platform
 * with a Pay Now button. With nothing due the button stays but cannot be pressed.
 */
export function ProviderProfileHeader({ user }: { user: User }) {
  const { dueAmount, payDue } = useProviderWallet(user.id);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const hasDue = dueAmount > 0;
  const rating = Number(user.providerProfile?.rating) || 0;

  return (
    <div className="flex items-center justify-between gap-[8px]">
      <div className="flex min-w-0 items-center gap-[10px]">
        {user.profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
          <img src={user.profilePhoto} alt="" className="size-[44px] shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-[#d7fdd2] text-[18px] font-semibold text-[#205737]">
            {(user.name || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-[8px]">
            <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{user.name || 'My account'}</span>
            {/* Opens "আমার রিভিউ": what each customer said about this provider's work. */}
            <MyRatingButton userId={user.id} role="PROVIDER" storedRating={rating} />
          </div>
          <span className="flex items-center gap-[4px] text-[13px] font-semibold text-[#202939]">
            {hasDue ? (
              <>
                {formatTaka(dueAmount)} <span className="rounded-full border border-[#202939]/40 px-[5px] text-[10px]">Due</span>
              </>
            ) : (
              <span className="text-[12px] font-medium text-[#697586]">No due</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[6px]">
        {/* Phones only: the left rail (where "আমার টিম" lives on wide screens) is hidden there. */}
        <TeamButton userId={user.id} variant="header" />
        <button
          type="button"
          disabled={!hasDue}
          onClick={() => setIsPayOpen(true)}
          className="shrink-0 cursor-pointer rounded-[10px] bg-[#202939] px-[16px] py-[10px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Pay Now
        </button>
      </div>

      {isPayOpen && (
        <ProviderPayDueDialog
          dueAmount={dueAmount}
          isPaying={payDue.isPending}
          onPay={(method) => payDue.mutate(method, { onSuccess: () => setIsPayOpen(false) })}
          onClose={() => setIsPayOpen(false)}
        />
      )}
    </div>
  );
}
