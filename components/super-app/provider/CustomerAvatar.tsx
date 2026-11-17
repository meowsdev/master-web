import { Order } from '@/types/order.types';

/** The ordering customer's photo, or their initial on mint. */
export function CustomerAvatar({ order, sizeClass = 'size-[44px]' }: { order: Order; sizeClass?: string }) {
  const customer = order.customer?.user;
  return (
    <span className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a9e5cf] text-[18px] font-semibold text-[#205737]`}>
      {customer?.profilePhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
        <img src={customer.profilePhoto} alt="" className="size-full object-cover" />
      ) : (
        (customer?.name ?? '?').charAt(0).toUpperCase()
      )}
    </span>
  );
}
