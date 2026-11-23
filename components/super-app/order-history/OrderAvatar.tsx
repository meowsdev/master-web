import { Order } from '@/types/order.types';

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/** Who is handling the order (their photo), else the service's own picture, else its initial. */
export function orderPictureSource(order: Order): string | null {
  return order.assignmentCard?.photoUrl || order.service?.imageUrl || order.service?.category?.iconUrl || null;
}

export function OrderAvatar({ order, sizeClass = 'size-[44px]' }: { order: Order; sizeClass?: string }) {
  const source = orderPictureSource(order);
  return (
    <span className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[18px]`}>
      {source && isImageSource(source) ? (
        // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
        <img src={source} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{source || (order.service?.name ?? '?').charAt(0)}</span>
      )}
    </span>
  );
}
