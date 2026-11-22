'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { servicesService } from '@/services/services.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User } from '@/types/auth.types';
import { Service } from '@/types/service.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

function ServiceAvatar({ service }: { service: Service }) {
  const source = service.imageUrl || service.category?.iconUrl || null;
  return (
    <span className="flex size-[44px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a9e5cf] text-[18px]">
      {source && isImageSource(source) ? (
        // eslint-disable-next-line @next/next/no-img-element -- image URLs come from arbitrary hosts
        <img src={source} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{source || service.name.charAt(0)}</span>
      )}
    </span>
  );
}

/* The + of the Services list: a new main service (category) or a new service under one. */
function CreateMenu({ onNewService, onNewCategory, onOpenCatalog }: { onNewService: () => void; onNewCategory: () => void; onOpenCatalog: () => void }) {
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
        <div role="menu" className="absolute right-0 top-[46px] z-30 w-[200px] rounded-[12px] border border-[#e5e5e5] bg-white p-[6px] shadow-lg">
          <button type="button" role="menuitem" className={itemClass} onClick={() => { setIsOpen(false); onNewCategory(); }}>New main service</button>
          <button type="button" role="menuitem" className={itemClass} onClick={() => { setIsOpen(false); onNewService(); }}>New service</button>
          <button type="button" role="menuitem" className={itemClass} onClick={() => { setIsOpen(false); onOpenCatalog(); }}>Catalog editor</button>
        </div>
      )}
    </div>
  );
}

/*
 * The Services view of the admin's sidebar: a heading with a + to create a new service, the same search
 * and category chips as the customer's service list, and one row per service. Choosing one opens its editor.
 */
export function AdminServicesSidebar({ user, onServiceOpened, onOpenAuth }: { user: User; onServiceOpened: () => void; onOpenAuth: () => void }) {
  const { data: services = [], isLoading } = useQuery({ queryKey: ['admin-services'], queryFn: () => servicesService.getServices() });
  const { data: categories = [] } = useQuery({ queryKey: ['admin-categories'], queryFn: servicesService.getCategories });
  // The open panel holds the service id (or 'new'), which also marks the selected row.
  const panelKind = useOrderPanelStore((state) => state.kind);
  const panelTarget = useOrderPanelStore((state) => state.orderId);
  const openPanel = useOrderPanelStore((state) => state.open);
  const target = panelKind === 'adminService' ? panelTarget : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const visibleServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return services
      .filter((service) => activeCategory === 'All' || service.category?.name === activeCategory)
      .filter((service) => !query || `${service.name} ${service.nameBn ?? ''} ${service.category?.name ?? ''}`.toLowerCase().includes(query));
  }, [services, searchQuery, activeCategory]);

  const open = (nextTarget: string) => {
    openPanel(nextTarget, 'adminService');
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
        categoryNames={categories.map((category) => category.name)}
        isSearchCollapsed={false}
        searchPlaceholder="Search services..."
        profileSlot={
          <div className="flex items-center justify-between">
            <span className="text-[18px] font-semibold tracking-[-0.36px] text-[#202939]">Services</span>
            <CreateMenu onNewService={() => open('new')} onNewCategory={() => { openPanel(null, 'adminCategory'); onServiceOpened(); }} onOpenCatalog={() => { openPanel(null, 'adminCatalog'); onServiceOpened(); }} />
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[8px] pb-[8px]">
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-[#697586]">Loading services...</p>}
        {!isLoading && visibleServices.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-[#697586]">No services match.</p>}
        {visibleServices.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => open(service.id)}
            aria-current={service.id === target ? 'true' : undefined}
            className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[16px] px-[12px] py-[10px] text-left transition-colors ${service.id === target ? 'bg-[#f7f5f3]' : 'hover:bg-[#f7f5f3]/60'}`}
          >
            <ServiceAvatar service={service} />
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{service.nameBn || service.name}</span>
              <div className="flex items-center justify-between gap-[8px] text-[13px] font-medium text-[#697586]">
                <span className="truncate">{service.category?.name}</span>
                <span className="shrink-0">{formatTaka(service.basePrice)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
