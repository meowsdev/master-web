'use client';

import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Calendar03Icon, Delete02Icon, PencilEdit01Icon, PencilEdit02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { useTapToSchedule } from '@/components/modals/catalog/ScheduleDialogHost';
import { PublishToggle } from '@/components/super-app/admin/panels/PublishToggle';
import { useAction } from '@/components/super-app/admin/panels/ServiceContentEditor';
import { useAdminCatalog } from '@/components/super-app/admin/useAdminCatalog';
import { catalogService } from '@/services/catalog.service';
import { adminService } from '@/services/admin.service';
import { AdminSubService, catalogAdminService } from '@/services/catalog-admin.service';
import { useCartStore } from '@/store/useCartStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { CatalogSubServiceCard, CatalogVariant } from '@/types/catalog.types';
import { CartBar } from './CartBar';

interface ServicesTabProps {
  mainServiceId: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  /** Staff who manage services also see unpublished packages, with publish, edit, delete and "Add New Package". */
  canEdit?: boolean;
}

/** One package card, whether it came from the customer read or the staff catalog. */
interface PackageCard {
  id: string;
  name: string;
  nameBn?: string | null;
  imageUrl?: string | null;
  startsFrom: number;
  discount: number | null;
  isPublished: boolean;
  /** Published options only: what a customer can add. */
  variants: CatalogVariant[];
}

const isImageSource = (value?: string | null) => Boolean(value && /^(https?:)?\/\/|^\//.test(value));
/** "৳299.63": the cards show plain digits, as in the design. */
export const plainTaka = (amount: number) => `৳${Number(amount.toFixed(2))}`;

const fromCustomerCard = (service: CatalogSubServiceCard): PackageCard => ({
  id: service.id,
  name: service.name,
  nameBn: service.nameBn,
  imageUrl: service.imageUrl,
  startsFrom: service.startsFrom,
  discount: service.discount,
  isPublished: true,
  variants: service.variants,
});

function fromStaffCatalog(sub: AdminSubService): PackageCard {
  const live = sub.variants.filter((variant) => variant.isActive);
  const cheapest = live.reduce<(typeof live)[number] | null>((low, variant) => (!low || Number(variant.price) < Number(low.price) ? variant : low), null);
  const price = cheapest ? Number(cheapest.price) : Number(sub.basePrice);
  const original = cheapest?.originalPrice != null ? Number(cheapest.originalPrice) : null;
  return {
    id: sub.id,
    name: sub.name,
    nameBn: sub.nameBn,
    imageUrl: sub.imageUrl,
    startsFrom: price,
    discount: original !== null && original > price ? original - price : null,
    isPublished: sub.isActive,
    variants: live.map((variant) => ({ ...variant, priceUnit: variant.priceUnit })),
  };
}

/*
 * The "Services" tab of a main service: its packages as cards in two columns. A card opens its options on the right;
 * its Tap to Schedule opens the calendar for the cart. Everyone sees the same screen; staff with service rights also
 * publish / unpublish, edit, delete and add.
 */
export function ServicesTab({ mainServiceId, isAuthenticated, onRequireAuth, canEdit = false }: ServicesTabProps) {
  const customerRead = useQuery({
    queryKey: ['catalog-main-service', mainServiceId],
    queryFn: () => catalogService.getMainService(mainServiceId),
    staleTime: 30_000,
    enabled: !canEdit,
  });
  // Staff read the full catalog, so unpublished packages show too.
  const staffRead = useAdminCatalog({ enabled: canEdit });
  const staffMain = staffRead.mains.find((main) => main.id === mainServiceId);

  const openSubService = useCatalogPanelStore((state) => state.openSubService);
  const openCustom = useCatalogPanelStore((state) => state.openCustom);
  const selectedId = useCatalogPanelStore((state) => (state.mainServiceId === mainServiceId && state.kind === 'subService' ? state.subServiceId : null));
  const isPanelOpen = useCatalogPanelStore((state) => state.kind !== null && state.mainServiceId === mainServiceId);
  const openAdminPanel = useOrderPanelStore((state) => state.open);
  const cartLines = useCartStore((state) => state.carts[mainServiceId]);
  const addToCart = useCartStore((state) => state.add);
  const tapToSchedule = useTapToSchedule(onRequireAuth);
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: (id: string) => adminService.deleteService(id),
    onSuccess: () => {
      toast.success('Package deleted');
      ['catalog-main-service', 'admin-catalog-tree', 'admin-services', 'super-app-services'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
    onError: () => toast.error('Package delete হয়নি'),
  });
  const publish = useAction(({ id, isActive }: { id: string; isActive: boolean }) => catalogAdminService.updateSubService(id, { isActive }), 'Saved');

  const isLoading = canEdit ? staffRead.isLoading : customerRead.isLoading;
  const isError = canEdit ? !staffRead.isLoading && !staffMain : customerRead.isError || (!customerRead.isLoading && !customerRead.data);
  const fallbackIcon = canEdit ? staffMain?.iconUrl : customerRead.data?.iconUrl;
  const packages: PackageCard[] = canEdit ? (staffMain?.services ?? []).map(fromStaffCatalog) : (customerRead.data?.services ?? []).map(fromCustomerCard);
  // Two columns, filled left, right, left...; one column on small screens.
  const columns = [packages.filter((_, index) => index % 2 === 0), packages.filter((_, index) => index % 2 === 1)];

  /*
   * Tap to Schedule on a card: the calendar opens once this package is in the cart. A package with a single option
   * goes in by itself; with several, its options open on the right so one can be picked first.
   */
  const scheduleFrom = (card: PackageCard) => {
    if (cartLines?.some((line) => line.subServiceId === card.id)) {
      tapToSchedule(mainServiceId);
      return;
    }
    const options = card.variants.filter((variant) => variant.id);
    if (options.length === 1) {
      const [only] = options;
      addToCart(mainServiceId, {
        variantId: only.id!,
        subServiceId: card.id,
        subServiceName: card.name,
        variantName: only.name,
        unitPrice: Number(only.price),
        priceUnit: only.priceUnit,
        quantity: 1,
        imageUrl: only.imageUrl ?? card.imageUrl ?? null,
      });
      tapToSchedule(mainServiceId);
      return;
    }
    openSubService(mainServiceId, card.id);
    toast.info('আগে একটা option বেছে Add করুন, তারপর Tap to Schedule');
  };

  const renderCard = (card: PackageCard) => (
    <SubServiceCard
      key={card.id}
      card={card}
      fallbackIcon={fallbackIcon}
      isSelected={card.id === selectedId}
      onSelect={() => openSubService(mainServiceId, card.id)}
      onSchedule={() => scheduleFrom(card)}
      staff={
        canEdit
          ? {
              onEdit: () => openAdminPanel(card.id, 'adminService'),
              onDelete: () => {
                if (window.confirm(`"${card.nameBn || card.name}" delete করবেন?`)) remove.mutate(card.id);
              },
              onPublish: (isActive) => publish.mutate({ id: card.id, isActive }),
            }
          : undefined
      }
    />
  );
  const addPackage = canEdit && (
    <button
      type="button"
      onClick={() => openAdminPanel(`new:${mainServiceId}`, 'adminService')}
      className="btn-raised mx-auto mt-[24px] flex h-[40px] cursor-pointer items-center gap-[6px] rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90"
    >
      <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2.5} />
      Add New Package
    </button>
  );
  const customCard = !canEdit && <CustomServiceCard onSelect={() => (isAuthenticated ? openCustom(mainServiceId) : onRequireAuth())} />;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface">
      <div className="flex-1 overflow-y-auto px-[16px] py-[32px] md:px-[32px]">
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <div className="py-[60px] text-center">
            <p className="text-[14px] font-medium text-muted">সার্ভিসগুলো লোড হয়নি।</p>
            <button type="button" onClick={() => customerRead.refetch()} className="mt-[8px] cursor-pointer text-[14px] font-semibold text-primary underline">
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <>
            {canEdit && staffMain && !staffMain.isActive && (
              <p className="mb-[16px] rounded-[8px] bg-amber-50 px-[12px] py-[8px] text-[13px] font-medium text-amber-800">
                এই main service unpublished, তাই customer এর কিছুই দেখতে পায় না।
              </p>
            )}
            {/* Phones: one column. */}
            <div className="flex flex-col gap-[22px] lg:hidden">
              {packages.map(renderCard)}
              {customCard}
              {addPackage}
            </div>
            {/* Wider screens: two columns side by side, each on its own grey panel, like the design. */}
            <div className="hidden items-start gap-[34px] lg:grid lg:grid-cols-2">
              {columns.map((column, index) => (
                <div key={index} className="flex flex-col">
                  {(column.length > 0 || (index === 1 && customCard)) && (
                    <div className="flex flex-col gap-[22px]">
                      {column.map(renderCard)}
                      {index === 1 && customCard}
                    </div>
                  )}
                  {index === 1 && addPackage}
                </div>
              ))}
            </div>
            {packages.length === 0 && (
              <p className="mt-[16px] text-center text-[13px] text-muted">
                {canEdit ? 'এই main service-এ এখনো কোনো package নেই। Add New Package দিয়ে যোগ করুন।' : 'এই সার্ভিসে এখনো কোনো অপশন যোগ হয়নি। Custom দিয়ে আপনার সমস্যা লিখে পাঠান।'}
              </p>
            )}
          </>
        )}
      </div>

      {/* One Tap to Schedule: it lives in the right-hand panel; this bar only stands in while that panel is closed. */}
      {!canEdit && !isPanelOpen && <CartBar mainServiceId={mainServiceId} isAuthenticated={isAuthenticated} onRequireAuth={onRequireAuth} />}
    </div>
  );
}

interface SubServiceCardProps {
  card: PackageCard;
  fallbackIcon?: string | null;
  isSelected: boolean;
  onSelect: () => void;
  onSchedule: () => void;
  staff?: { onEdit: () => void; onDelete: () => void; onPublish: (isActive: boolean) => void };
}

const iconButton = 'flex size-[30px] cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface';

function SubServiceCard({ card, fallbackIcon, isSelected, onSelect, onSchedule, staff }: SubServiceCardProps) {
  return (
    <div className={`rounded-[4px] border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${isSelected ? 'border-primary' : 'border-line'}`}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`flex w-full cursor-pointer items-center gap-[12px] p-[12px] text-left ${card.isPublished ? '' : 'opacity-50'}`}
      >
        <span className="relative size-[64px] shrink-0 overflow-hidden rounded-[2px] bg-gradient-to-b from-secondary to-surface">
          {isImageSource(card.imageUrl) ? (
            <Image src={card.imageUrl!} alt="" fill sizes="64px" unoptimized className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-[28px]" aria-hidden>
              {fallbackIcon && !isImageSource(fallbackIcon) ? fallbackIcon : '🛠️'}
            </span>
          )}
          {card.discount !== null && (
            <span className="absolute inset-x-0 bottom-0 truncate bg-primary px-[3px] text-[10px] font-bold leading-[14px] text-white">
              {Math.round(card.discount)} BDT OFF
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <span className="truncate text-[14px] font-semibold leading-[20px] tracking-[0.1px] text-ink">{card.nameBn || card.name}</span>
          <span className="text-[14px] leading-[20px] tracking-[0.1px] text-ink">
            Starts from <span className="font-bold text-primary">{plainTaka(card.startsFrom)}</span>
          </span>
        </span>
        <span aria-hidden className={`flex size-[14px] shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-ink' : 'border-muted'}`}>
          {isSelected && <span className="size-[8px] rounded-full bg-ink" />}
        </span>
      </button>

      <div className="flex h-[44px] items-center justify-between gap-[8px] border-t border-line px-[14px]">
        <button type="button" onClick={onSchedule} className="flex cursor-pointer items-center gap-[10px] text-ink">
          <HugeiconsIcon icon={Calendar03Icon} size={18} strokeWidth={1.6} />
          <span className="text-[11px] font-medium text-ink">Tap to Schedule</span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={1.8} />
        </button>
        {staff && (
          <div className="flex items-center gap-[12px]">
            <PublishToggle isPublished={card.isPublished} onChange={staff.onPublish} />
            <button type="button" aria-label={`Edit ${card.name}`} onClick={staff.onEdit} className={iconButton}>
              <HugeiconsIcon icon={PencilEdit01Icon} size={22} strokeWidth={1.6} />
            </button>
            <button type="button" aria-label={`Delete ${card.name}`} onClick={staff.onDelete} className={iconButton}>
              <HugeiconsIcon icon={Delete02Icon} size={22} strokeWidth={1.6} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Customers only: for a problem the list does not have. The provider visits for free and sends a price. */
function CustomServiceCard({ onSelect }: { onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex cursor-pointer items-center gap-[12px] rounded-[4px] border border-dashed border-secondary bg-white p-[12px] text-left transition-shadow hover:shadow-md"
    >
      <span className="flex size-[64px] shrink-0 items-center justify-center rounded-[2px] bg-secondary text-primary">
        <HugeiconsIcon icon={PencilEdit02Icon} size={26} strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-col gap-[4px]">
        <span className="text-[14px] font-semibold text-ink">Custom</span>
        <span className="text-[12px] leading-snug text-muted">লিস্টে নেই? সমস্যা লিখুন, প্রোভাইডার ভিজিট করে দাম জানাবে। ভিজিট ফ্রি।</span>
      </span>
    </button>
  );
}

function ListSkeleton() {
  return (
    <div className="grid animate-pulse gap-[22px] lg:grid-cols-2 lg:gap-[34px]">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-[134px] rounded-[4px] bg-panel" />
      ))}
    </div>
  );
}
