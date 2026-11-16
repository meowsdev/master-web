'use client';

import Image from 'next/image';
import { OrderMainService, OrderSubService } from '@/types/order-placement.types';

interface ServiceAvatarProps {
  category?: OrderMainService;
  subService?: OrderSubService;
}

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/*
 * The service's profile photo at the top of the panel: the chosen sub-service's
 * own photo, else its main service's icon (an emoji today), else the brand mark.
 */
export function ServiceAvatar({ category, subService }: ServiceAvatarProps) {
  const source = subService?.imageUrl || category?.iconUrl || null;

  return (
    <div className="mb-[8px] mt-[4px] flex justify-center">
      <span className="flex size-[78px] items-center justify-center overflow-hidden rounded-full border border-[#202939]/40 bg-[#a9e5cf] text-[34px]">
        {source && isImageSource(source) ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
          <img src={source} alt="" className="size-full object-cover" />
        ) : source ? (
          <span aria-hidden>{source}</span>
        ) : (
          <Image src="/chat-list/provider.svg" alt="" width={36} height={36} />
        )}
      </span>
    </div>
  );
}
