'use client';

import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';
import { User } from '@/types/auth.types';

interface CustomerProfileHeaderProps {
  user: User;
  onStartNewOrder: () => void;
}

/*
 * Signed-in customers see themselves where the brand row used to be:
 * name, rating and how many orders were completed, plus a shortcut to start a new order.
 */
export function CustomerProfileHeader({ user, onStartNewOrder }: CustomerProfileHeaderProps) {
  // Same key as OrdersDrawer / useServicesFilter, so this reuses their cache instead of refetching.
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['my-orders-drawer', user.id],
    queryFn: () => ordersService.getOrders(),
    staleTime: 10000,
  });

  const completedCount = orders.filter((order) => order.orderStatus === OrderStatus.COMPLETED).length;
  // The backend does not rate customers yet; show "New" rather than inventing a number.
  const storedRating = Number(user.customerProfile?.rating);
  const ratingLabel = storedRating > 0 ? storedRating.toFixed(1) : 'New';

  return (
    <div className="flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-[10px]">
        <ProfileAvatar user={user} />
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-[8px]">
            <span className="truncate text-[16px] font-semibold tracking-[-0.32px] text-[#202939]">
              {user.name || 'My account'}
            </span>
            <span className="flex shrink-0 items-center gap-[3px] text-[13px] font-semibold text-[#202939]">
              <Image src="/chat-list/star.svg" alt="" width={12} height={11.4} />
              {ratingLabel}
            </span>
          </div>
          <span className="flex items-center gap-[4px] text-[12px] font-medium text-[#697586]">
            <span className="flex size-[16px] items-center justify-center rounded-full bg-[#1daa61]">
              <Image src="/chat-list/completed-check.svg" alt="" width={9} height={8.6} />
            </span>
            {completedCount}+ Completed
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onStartNewOrder}
        title="Start a new order"
        aria-label="Start a new order"
        className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1daa61] text-white transition-transform hover:scale-105"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** Profile photo when the customer has one, otherwise their initial on the brand green. */
function ProfileAvatar({ user }: { user: User }) {
  if (user.profilePhoto) {
    // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
    return <img src={user.profilePhoto} alt="" className="size-[44px] shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-[#d7fdd2] text-[18px] font-semibold text-[#205737]">
      {(user.name || '?').charAt(0).toUpperCase()}
    </span>
  );
}
