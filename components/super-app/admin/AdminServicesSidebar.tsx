'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useAdminCatalogStore } from '@/store/useAdminCatalogStore';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User } from '@/types/auth.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';
import { isImageSource, useAdminCatalog } from './useAdminCatalog';

const NO_CATEGORY = 'Category নেই';

function MainAvatar({ icon, name }: { icon?: string | null; name: string }) {
  return (
    <span className="flex size-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a9e5cf] text-[20px]">
      {icon && isImageSource(icon) ? (
        // eslint-disable-next-line @next/next/no-img-element -- image URLs come from arbitrary hosts
        <img src={icon} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{icon || name.charAt(0)}</span>
      )}
    </span>
  );
}

/* The + of the Services list: a new main service, a new service under the open one, or the category editor. */
function CreateMenu({ onNewService, onNewMainService, onOpenCategories }: { onNewService: () => void; onNewMainService: () => void; onOpenCategories: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  const itemClass = 'w-full cursor-pointer rounded-[8px] px-[12px] py-[10px] text-left text-[14px] font-semibold text-[#202939] hover:bg-[#f7f5f3]';
  const pick = (action: () => void) => () => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        title="Create"
        aria-label="Create"
        aria-expanded={isOpen}
        className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1daa61] text-white transition-transform hover:scale-105"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={22} strokeWidth={2.5} />
      </button>
      {isOpen && (
        <div role="menu" className="absolute right-0 top-[46px] z-30 w-[220px] rounded-[12px] border border-[#e5e5e5] bg-white p-[6px] shadow-lg">
          <button type="button" role="menuitem" className={itemClass} onClick={pick(onNewMainService)}>New main service</button>
          <button type="button" role="menuitem" className={itemClass} onClick={pick(onNewService)}>New service</button>
          <button type="button" role="menuitem" className={itemClass} onClick={pick(onOpenCategories)}>Categories ও সাজানো</button>
        </div>
      )}
    </div>
  );
}

/*
 * The Services view of the admin's sidebar, laid out like the customer's list: category chips on top, then one row
 * per main service. Choosing a row shows its sub-services in the middle, as cards, the way the customer sees them.
 */
export function AdminServicesSidebar({ user, onServiceOpened, onOpenAuth }: { user: User; onServiceOpened: () => void; onOpenAuth: () => void }) {
  const { groups, mains, isLoading } = useAdminCatalog();
  const selectedId = useAdminCatalogStore((state) => state.mainServiceId);
  const selectMainService = useAdminCatalogStore((state) => state.selectMainService);
  const openPanel = useOrderPanelStore((state) => state.open);
  const closePanel = useOrderPanelStore((state) => state.close);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const hasUngrouped = mains.some((main) => !main.group);

  const visibleMains = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mains
      .filter((main) => activeCategory === 'All' || (activeCategory === NO_CATEGORY ? !main.group : main.group?.name === activeCategory))
      .filter((main) => {
        if (!query) return true;
        const text = [main.name, main.group?.name ?? '', ...main.services.flatMap((sub) => [sub.name, sub.nameBn ?? ''])].join(' ');
        return text.toLowerCase().includes(query);
      });
  }, [mains, searchQuery, activeCategory]);

  const select = (id: string) => {
    selectMainService(id);
    closePanel();
    onServiceOpened();
  };
  const openSide = (target: string | null, kind: 'adminCategory' | 'adminService' | 'adminCatalog') => {
    openPanel(target, kind);
    onServiceOpened();
  };

  return (
    <>
      <CustomerSidebarTop
        isAuthenticated
        user={user}
        onOpenAuth={onOpenAuth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => {}}
        onSearchBlur={() => {}}
        activeFilterChip={activeCategory}
        onSelectFilterChip={setActiveCategory}
        categoryNames={[...groups.map((group) => group.name), ...(hasUngrouped ? [NO_CATEGORY] : [])]}
        isSearchCollapsed={false}
        searchPlaceholder="Search services..."
        profileSlot={
          <div className="flex items-center justify-between">
            <span className="text-[18px] font-semibold tracking-[-0.36px] text-[#202939]">Services</span>
            <CreateMenu
              onNewMainService={() => openSide(null, 'adminCategory')}
              onNewService={() => openSide(selectedId ? `new:${selectedId}` : 'new', 'adminService')}
              onOpenCategories={() => openSide(null, 'adminCatalog')}
            />
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[8px] pb-[8px]">
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-[#697586]">Loading services...</p>}
        {!isLoading && visibleMains.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-[#697586]">No services match.</p>}
        {visibleMains.map((main) => {
          const prices = main.services
            .flatMap((sub) => (sub.variants.length ? sub.variants.map((variant) => Number(variant.price)) : [Number(sub.basePrice)]))
            .filter((price) => price > 0);
          const isSelected = main.id === selectedId;
          const isHidden = !main.isActive || (main.group !== null && !main.group.isActive);
          return (
            <button
              key={main.id}
              type="button"
              onClick={() => select(main.id)}
              aria-current={isSelected ? 'true' : undefined}
              className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[16px] px-[12px] py-[10px] text-left transition-colors ${isSelected ? 'bg-[#f7f5f3]' : 'hover:bg-[#f7f5f3]/60'}`}
            >
              <MainAvatar icon={main.iconUrl} name={main.name} />
              <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{main.name}</span>
                <div className="flex items-center justify-between gap-[8px] text-[13px] font-medium text-[#697586]">
                  <span className="truncate">
                    {!main.group ? <span className="text-amber-700">{NO_CATEGORY}</span> : isHidden ? 'Hidden' : `${main.services.length} services`}
                  </span>
                  {prices.length > 0 && <span className="shrink-0">from {formatTaka(Math.min(...prices))}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
