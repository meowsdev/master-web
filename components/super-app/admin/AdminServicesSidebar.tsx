'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { mainServiceToEntry } from '@/lib/main-service';
import { catalogService } from '@/services/catalog.service';
import { catalogAdminService } from '@/services/catalog-admin.service';
import { useAdminCatalogStore } from '@/store/useAdminCatalogStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User } from '@/types/auth.types';
import { Service } from '@/types/service.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';
import { ServiceListItem } from '../ServiceListItem';
import { filterChipClass } from '../ChipRow';
import { useAction } from './panels/ServiceContentEditor';
import { AdminMainEntry, useAdminCatalog } from './useAdminCatalog';
import { StaffSidebarHeader } from './AdminProfileHeader';

const NO_CATEGORY = 'Category নেই';

/* A main service customers cannot see yet (hidden, or in no category), shaped like a list row. */
function hiddenEntry(main: AdminMainEntry): Service {
  const now = new Date(0).toISOString();
  return {
    id: main.id,
    categoryId: main.id,
    name: main.name,
    description: main.group ? 'Hidden' : NO_CATEGORY,
    isFixedPrice: false,
    basePrice: 0,
    isActive: false,
    isMainService: true,
    groupId: main.groupId,
    category: { id: main.id, name: main.group?.name ?? NO_CATEGORY, slug: main.id, iconUrl: main.iconUrl ?? null, isFixedPrice: false, basePrice: 0, isActive: false, createdAt: now, updatedAt: now },
    createdAt: now,
    updatedAt: now,
  };
}

/* The "Add" chip: turns into a small box for the new category's name. */
function AddCategoryChip() {
  const [isTyping, setIsTyping] = useState(false);
  const [name, setName] = useState('');
  const create = useAction((value: string) => catalogAdminService.createGroup({ name: value }), 'Category added');
  // The same chip as the filters beside it.
  const chipClass = filterChipClass(false);

  if (!isTyping) {
    return (
      <button type="button" onClick={() => setIsTyping(true)} className={`${chipClass} cursor-pointer hover:bg-surface`}>
        Add
      </button>
    );
  }
  return (
    <form
      className="shrink-0"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim()) create.mutate(name.trim(), { onSuccess: () => { setName(''); setIsTyping(false); } });
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => !name.trim() && setIsTyping(false)}
        onKeyDown={(event) => event.key === 'Escape' && setIsTyping(false)}
        maxLength={100}
        placeholder="Category নাম, Enter"
        className={`${chipClass} w-[180px] text-[14px] text-ink outline-none focus:border-primary`}
      />
    </form>
  );
}

/*
 * The Services view of a staff member with service rights: the customer's list, row for row (category chips, one
 * row per main service), plus what only staff may do: Add a category, + / Add New Services for a main service, and
 * the main services customers cannot see yet at the end.
 */
export function AdminServicesSidebar({ user, onServiceOpened, onOpenAuth }: { user: User; onServiceOpened: () => void; onOpenAuth: () => void }) {
  const { data: publicEntries = [], isLoading } = useQuery<Service[]>({
    queryKey: ['super-app-services'],
    queryFn: async () => (await catalogService.getMainServices()).map(mainServiceToEntry),
  });
  const { groups, mains } = useAdminCatalog();
  const selectedId = useAdminCatalogStore((state) => state.mainServiceId);
  const selectMainService = useAdminCatalogStore((state) => state.selectMainService);
  const openPanel = useOrderPanelStore((state) => state.open);
  const closePanel = useOrderPanelStore((state) => state.close);
  const openMainService = useCatalogPanelStore((state) => state.openMainService);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const entries = useMemo(() => {
    const shown = new Set(publicEntries.map((entry) => entry.id));
    return [...publicEntries, ...mains.filter((main) => !shown.has(main.id)).map(hiddenEntry)];
  }, [publicEntries, mains]);
  const hasUngrouped = mains.some((main) => !main.group);

  const visibleEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return entries
      .filter((entry) => activeCategory === 'All' || entry.category?.name === activeCategory)
      .filter((entry) => !query || `${entry.name} ${entry.category?.name ?? ''}`.toLowerCase().includes(query));
  }, [entries, searchQuery, activeCategory]);

  const select = (entry: Service) => {
    selectMainService(entry.id);
    closePanel();
    // Same as the customer: its Overview, FAQ, How to Order, Review and Details open on the right, here with edit.
    openMainService(entry.id);
    onServiceOpened();
  };
  const newMainService = () => {
    openPanel(null, 'adminCategory');
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
        chipsTrailing={<AddCategoryChip />}
        isSearchCollapsed={false}
        searchPlaceholder="Search services..."
        profileSlot={<StaffSidebarHeader user={user} action={{ label: 'New main service', onClick: newMainService }} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[8px] pb-[24px]">
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">Loading services...</p>}
        {!isLoading && visibleEntries.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-muted">No services match.</p>}
        {visibleEntries.map((entry) => (
          <div key={entry.id} className={entry.isActive ? '' : 'opacity-60'}>
            <ServiceListItem service={entry} isSelected={entry.id === selectedId} onSelect={select} isDarkMode={false} />
          </div>
        ))}
        <button
          type="button"
          onClick={newMainService}
          className="btn-raised mx-auto mt-[16px] flex h-[40px] cursor-pointer items-center gap-[6px] rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2.5} />
          Add New Services
        </button>
      </div>
    </>
  );
}
