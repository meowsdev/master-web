'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit02Icon, StarIcon } from '@hugeicons/core-free-icons';
import { catalogService } from '@/services/catalog.service';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { CatalogSubServiceCard } from '@/types/catalog.types';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { CartBar } from './CartBar';

interface ServicesTabProps {
  mainServiceId: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

const isImageSource = (value?: string | null) => Boolean(value && /^(https?:)?\/\/|^\//.test(value));

/*
 * The "Services" tab of a main service's chat (wireframe: Custom card first, then the sub-service cards in a grid).
 * Picking a card opens its details on the right; the cart of this main service sits at the bottom.
 */
export function ServicesTab({ mainServiceId, isAuthenticated, onRequireAuth }: ServicesTabProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalog-main-service', mainServiceId],
    queryFn: () => catalogService.getMainService(mainServiceId),
    staleTime: 30_000,
  });
  const openSubService = useCatalogPanelStore((state) => state.openSubService);
  const openCustom = useCatalogPanelStore((state) => state.openCustom);
  const selectedId = useCatalogPanelStore((state) => (state.mainServiceId === mainServiceId ? state.subServiceId : null));
  const isCustomOpen = useCatalogPanelStore((state) => state.kind === 'custom' && state.mainServiceId === mainServiceId);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f5f3]">
      <div className="flex-1 overflow-y-auto px-[16px] py-[20px] md:px-[24px]">
        {isLoading ? (
          <GridSkeleton />
        ) : isError || !data ? (
          <div className="py-[60px] text-center">
            <p className="text-[14px] font-medium text-[#697586]">সার্ভিসগুলো লোড হয়নি।</p>
            <button type="button" onClick={() => refetch()} className="mt-[8px] cursor-pointer text-[14px] font-semibold text-[#1daa61] underline">
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <>
            <header className="mb-[20px]">
              {data.group && <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#1daa61]">{data.group.name}</p>}
              <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.48px] text-[#202939] md:text-[28px]">{data.name}</h2>
              <div className="mt-[6px] flex flex-wrap items-center gap-x-[10px] gap-y-[4px] text-[14px] text-[#364152]">
                <span className="flex items-center gap-[4px] font-bold text-[#202939]">
                  <HugeiconsIcon icon={StarIcon} size={18} className="fill-[#f5a623] text-[#f5a623]" />
                  {data.rating?.average != null ? data.rating.average.toFixed(2) : 'New'}
                </span>
                {(data.servedCount ?? 0) > 0 && <span>• {data.servedCount}+ served</span>}
                <span className="text-[#697586]">
                  ({data.rating?.count ?? 0} reviews on {data.services.length} services)
                </span>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-[12px] sm:gap-[16px] lg:grid-cols-3">
              <CustomServiceCard isSelected={isCustomOpen} onSelect={() => (isAuthenticated ? openCustom(mainServiceId) : onRequireAuth())} />
              {data.services.map((service) => (
                <SubServiceCard
                  key={service.id}
                  service={service}
                  fallbackIcon={data.iconUrl}
                  isSelected={service.id === selectedId}
                  onSelect={() => openSubService(mainServiceId, service.id)}
                />
              ))}
            </div>
            {data.services.length === 0 && (
              <p className="mt-[16px] text-center text-[13px] text-[#697586]">এই সার্ভিসে এখনো কোনো অপশন যোগ হয়নি। Custom দিয়ে আপনার সমস্যা লিখে পাঠান।</p>
            )}
          </>
        )}
      </div>

      <CartBar mainServiceId={mainServiceId} isAuthenticated={isAuthenticated} onRequireAuth={onRequireAuth} />
    </div>
  );
}

function SubServiceCard({ service, fallbackIcon, isSelected, onSelect }: { service: CatalogSubServiceCard; fallbackIcon?: string | null; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-[16px] border bg-white text-left transition-all hover:shadow-md ${
        isSelected ? 'border-[#1daa61] ring-2 ring-[#1daa61]/30' : 'border-[#e5e5e5]'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-[#d7fdd2] to-[#f7f5f3]">
        {isImageSource(service.imageUrl) ? (
          <Image src={service.imageUrl!} alt="" fill sizes="(min-width: 1024px) 260px, 45vw" unoptimized className="object-cover transition-transform group-hover:scale-[1.03]" />
        ) : (
          <span className="flex size-full items-center justify-center text-[44px]" aria-hidden>
            {fallbackIcon && !isImageSource(fallbackIcon) ? fallbackIcon : '🛠️'}
          </span>
        )}
        {service.discount !== null && (
          <span className="absolute bottom-[8px] left-[8px] rounded-[6px] bg-[#c2410c] px-[6px] py-[2px] text-[11px] font-bold text-white">
            {formatTaka(service.discount)} OFF
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[4px] p-[12px]">
        <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#202939] md:text-[15px]">{service.nameBn || service.name}</span>
        <span className="mt-auto text-[12px] text-[#697586] md:text-[13px]">
          Starts from <span className="font-semibold text-[#15803d]">{formatTaka(service.startsFrom)}</span>
          {service.startsFromOriginal !== null && <span className="ml-[4px] text-[#9aa4b2] line-through">{formatTaka(service.startsFromOriginal)}</span>}
        </span>
      </div>
    </button>
  );
}

/* Always the first card: for a problem the list does not have. The provider visits for free and sends a price. */
function CustomServiceCard({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex cursor-pointer flex-col items-center justify-center gap-[10px] rounded-[16px] border-2 border-dashed bg-gradient-to-b from-white to-[#e7fce3] p-[16px] text-center transition-shadow hover:shadow-md ${
        isSelected ? 'border-[#1daa61]' : 'border-[#9fd8b4]'
      }`}
    >
      <span className="flex size-[48px] items-center justify-center rounded-full border-[1.5px] border-[#1daa61] text-[#1daa61]">
        <HugeiconsIcon icon={PencilEdit02Icon} size={22} strokeWidth={1.8} />
      </span>
      <span className="text-[15px] font-semibold text-[#202939]">Custom</span>
      <span className="text-[12px] leading-snug text-[#697586]">লিস্টে নেই? সমস্যা লিখুন, প্রোভাইডার ভিজিট করে দাম জানাবে। ভিজিট ফ্রি।</span>
    </button>
  );
}

function GridSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-[8px] h-[28px] w-[200px] rounded bg-[#e5e5e5]" />
      <div className="mb-[20px] h-[16px] w-[260px] rounded bg-[#ececec]" />
      <div className="grid grid-cols-2 gap-[16px] lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-[4/5] rounded-[16px] bg-[#ececec]" />
        ))}
      </div>
    </div>
  );
}
