'use client';

import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { AdminSubService } from '@/services/catalog-admin.service';
import { useAdminCatalogStore } from '@/store/useAdminCatalogStore';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { AdminMainEntry, isImageSource, useAdminCatalog } from './useAdminCatalog';

/*
 * The middle of the admin's Services tab, built like the customer's Services tab: the main service's heading, then
 * its sub-services as the same cards. A card opens that sub-service's editor on the right; the first card adds one.
 */
export function AdminMainServiceCanvas() {
  const { mains, isLoading } = useAdminCatalog();
  const mainServiceId = useAdminCatalogStore((state) => state.mainServiceId);
  const main = mains.find((item) => item.id === mainServiceId);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f5f3]">
      <div className="flex-1 overflow-y-auto px-[16px] py-[20px] md:px-[24px]">
        {main ? (
          <MainServiceView main={main} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-[6px] text-center">
            <p className="text-[16px] font-semibold text-[#202939]">{isLoading ? 'Loading...' : 'বাম পাশ থেকে একটা main service বাছুন'}</p>
            {!isLoading && <p className="text-[13px] text-[#697586]">কাস্টমার যেভাবে দেখে, ঠিক সেভাবে এখানে দেখাবে।</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function MainServiceView({ main }: { main: AdminMainEntry }) {
  const openPanel = useOrderPanelStore((state) => state.open);
  const panelKind = useOrderPanelStore((state) => state.kind);
  const panelTarget = useOrderPanelStore((state) => state.orderId);
  const isHidden = !main.isActive || (main.group !== null && !main.group.isActive);

  return (
    <>
      <header className="mb-[20px] flex flex-wrap items-end justify-between gap-[12px]">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#1daa61]">
            {main.group?.name ?? <span className="text-amber-700">Category নেই, কাস্টমার দেখে না</span>}
          </p>
          <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.48px] text-[#202939] md:text-[28px]">{main.name}</h2>
          <p className="mt-[6px] text-[14px] text-[#697586]">
            {main.services.length} services{isHidden ? ' · Hidden' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openPanel(main.id, 'adminMainService')}
          className={`flex cursor-pointer items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[13px] font-semibold transition-colors ${
            panelKind === 'adminMainService' && panelTarget === main.id ? 'border-[#1daa61] bg-[#e7fce3] text-[#15803d]' : 'border-[#e5e5e5] bg-white text-[#202939] hover:bg-[#efefef]'
          }`}
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
          Edit main service
        </button>
      </header>

      <div className="grid grid-cols-2 gap-[12px] sm:gap-[16px] lg:grid-cols-3">
        <AddServiceCard isSelected={panelKind === 'adminService' && panelTarget === `new:${main.id}`} onSelect={() => openPanel(`new:${main.id}`, 'adminService')} />
        {main.services.map((sub) => (
          <SubServiceCard
            key={sub.id}
            sub={sub}
            fallbackIcon={main.iconUrl}
            isSelected={panelKind === 'adminService' && panelTarget === sub.id}
            onSelect={() => openPanel(sub.id, 'adminService')}
          />
        ))}
      </div>
    </>
  );
}

/* The customer's sub-service card, plus a Hidden badge for what customers do not see. */
function SubServiceCard({ sub, fallbackIcon, isSelected, onSelect }: { sub: AdminSubService; fallbackIcon?: string | null; isSelected: boolean; onSelect: () => void }) {
  const variants = sub.variants.filter((variant) => variant.isActive);
  const cheapest = variants.length ? variants.reduce((low, variant) => (Number(variant.price) < Number(low.price) ? variant : low)) : null;
  const startsFrom = cheapest ? Number(cheapest.price) : Number(sub.basePrice);
  const original = cheapest?.originalPrice ? Number(cheapest.originalPrice) : null;
  const discount = original && original > startsFrom ? original - startsFrom : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-[16px] border bg-white text-left transition-all hover:shadow-md ${
        isSelected ? 'border-[#1daa61] ring-2 ring-[#1daa61]/30' : 'border-[#e5e5e5]'
      } ${sub.isActive ? '' : 'opacity-60'}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-[#d7fdd2] to-[#f7f5f3]">
        {isImageSource(sub.imageUrl) ? (
          <Image src={sub.imageUrl!} alt="" fill sizes="(min-width: 1024px) 260px, 45vw" unoptimized className="object-cover transition-transform group-hover:scale-[1.03]" />
        ) : (
          <span className="flex size-full items-center justify-center text-[44px]" aria-hidden>
            {fallbackIcon && !isImageSource(fallbackIcon) ? fallbackIcon : '🛠️'}
          </span>
        )}
        {discount !== null && (
          <span className="absolute bottom-[8px] left-[8px] rounded-[6px] bg-[#c2410c] px-[6px] py-[2px] text-[11px] font-bold text-white">{formatTaka(discount)} OFF</span>
        )}
        {!sub.isActive && <span className="absolute right-[8px] top-[8px] rounded-[6px] bg-[#202939] px-[6px] py-[2px] text-[11px] font-bold text-white">Hidden</span>}
      </div>
      <div className="flex flex-1 flex-col gap-[4px] p-[12px]">
        <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#202939] md:text-[15px]">{sub.nameBn || sub.name}</span>
        <span className="mt-auto text-[12px] text-[#697586] md:text-[13px]">
          Starts from <span className="font-semibold text-[#15803d]">{formatTaka(startsFrom)}</span>
          {original !== null && original > startsFrom && <span className="ml-[4px] text-[#9aa4b2] line-through">{formatTaka(original)}</span>}
        </span>
        <span className="text-[11px] text-[#9aa4b2]">
          {sub.variants.length} options · {sub.faqs.length} FAQ
        </span>
      </div>
    </button>
  );
}

/* Where the customer sees the Custom card: here it adds a new sub-service to this main service. */
function AddServiceCard({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-[10px] rounded-[16px] border-2 border-dashed bg-gradient-to-b from-white to-[#e7fce3] p-[16px] text-center transition-shadow hover:shadow-md ${
        isSelected ? 'border-[#1daa61]' : 'border-[#9fd8b4]'
      }`}
    >
      <span className="flex size-[48px] items-center justify-center rounded-full border-[1.5px] border-[#1daa61] text-[#1daa61]">
        <HugeiconsIcon icon={PlusSignIcon} size={22} strokeWidth={2} />
      </span>
      <span className="text-[15px] font-semibold text-[#202939]">নতুন সার্ভিস</span>
      <span className="text-[12px] leading-snug text-[#697586]">এই main service-এ একটা sub-service যোগ করুন</span>
    </button>
  );
}
