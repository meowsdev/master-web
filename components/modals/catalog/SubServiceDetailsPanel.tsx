'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Delete02Icon, InformationCircleIcon, MinusSignIcon, PencilEdit01Icon, PlusSignIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { DetailsTab, useAction } from '@/components/super-app/admin/panels/ServiceContentEditor';
import { PublishToggle } from '@/components/super-app/admin/panels/PublishToggle';
import { useAdminCatalog } from '@/components/super-app/admin/useAdminCatalog';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { catalogService } from '@/services/catalog.service';
import { catalogAdminService } from '@/services/catalog-admin.service';
import { useCartStore } from '@/store/useCartStore';
import { CatalogVariant } from '@/types/catalog.types';
import { PriceUnit } from '@/types/service.types';
import { MainServiceInfo, useMainServiceView } from './MainServiceDetailsPanel';
import { ScheduleCta } from './ScheduleCta';

interface SubServiceDetailsPanelProps {
  mainServiceId: string;
  subServiceId: string;
  onClose: () => void;
}

/** Most a single option can be ordered at once, by how it is priced (the backend enforces the same limits). */
const MAX_QUANTITY = { FIXED: 1, PER_UNIT: 10, PER_SQFT: 10_000 } as const;
const isImageSource = (value?: string | null) => Boolean(value && /^(https?:)?\/\/|^\//.test(value));
/** "৳500": option prices keep plain digits. */
const plainTaka = (amount: number) => `৳${Number(amount.toFixed(2)).toLocaleString('en-US')}`;
const unitLabel = (unit: PriceUnit) => (unit === 'PER_SQFT' ? '/ sqft' : unit === 'PER_UNIT' ? '/ per' : '');

/** What the panel shows of a package: from the customer read, or (for staff) the full catalog with unpublished options. */
interface PackageView {
  id: string;
  name: string;
  imageUrl?: string | null;
  description?: string | null;
  /** The package's own notes or disclaimer. */
  packageDetails?: string | null;
  variants: OptionView[];
}
type OptionView = CatalogVariant & { isActive?: boolean };

/*
 * Right-hand panel of one package (sub-service), top to bottom: its options as cards (quantity, Add), the package's own
 * notes or disclaimer, then its main service's rating, Overview, FAQ, How to Order, Review and Details. Tap to Schedule
 * (ScheduleCta) stays pinned at the bottom. Staff see the same panel with publish, edit and delete.
 */
export function SubServiceDetailsPanel({ mainServiceId, subServiceId, onClose }: SubServiceDetailsPanelProps) {
  const { canManageServices: canEdit } = useStaffPermissions();
  const customerRead = useQuery({
    queryKey: ['catalog-sub-service', subServiceId],
    queryFn: () => catalogService.getSubService(subServiceId),
    staleTime: 30_000,
    enabled: !canEdit,
  });
  const staffRead = useAdminCatalog({ enabled: canEdit });
  const staffSub = staffRead.mains.flatMap((main) => main.services).find((sub) => sub.id === subServiceId);
  const main = useMainServiceView(mainServiceId);

  const view: PackageView | undefined = canEdit
    ? staffSub && {
        id: staffSub.id,
        name: staffSub.nameBn || staffSub.name,
        imageUrl: staffSub.imageUrl,
        description: staffSub.description,
        packageDetails: staffSub.details,
        variants: staffSub.variants,
      }
    : customerRead.data && { ...customerRead.data, name: customerRead.data.nameBn || customerRead.data.name };
  const isLoading = canEdit ? staffRead.isLoading : customerRead.isLoading;
  const optionCount = view?.variants.filter((variant) => variant.id && variant.isActive !== false).length ?? 0;

  return (
    <SidePanelShell
      title={view?.name ?? 'Service details'}
      titleNote={view ? `( ${optionCount} ${optionCount === 1 ? 'Option' : 'Options'} available)` : undefined}
      onClose={onClose}
      footer={<ScheduleCta mainServiceId={mainServiceId} />}
    >
      {isLoading ? (
        <div className="grid animate-pulse grid-cols-2 gap-[14px]">
          <div className="h-[280px] rounded-[14px] bg-surface" />
          <div className="h-[280px] rounded-[14px] bg-surface" />
        </div>
      ) : !view ? (
        <div className="py-[40px] text-center">
          <p className="text-[14px] text-muted">এই সার্ভিসটা এখন পাওয়া যাচ্ছে না।</p>
          {!canEdit && (
            <button type="button" onClick={() => customerRead.refetch()} className="mt-[8px] cursor-pointer font-semibold text-primary underline">আবার চেষ্টা করুন</button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-[24px] pb-[8px]">
          <Options key={view.id} view={view} mainServiceId={mainServiceId} canEdit={canEdit} />
          <PackageNotes view={view} canEdit={canEdit} />
          {main.data && (
            <>
              <div className="h-px bg-surface" />
              <MainServiceInfo key={main.data.id} data={main.data} embedded />
            </>
          )}
        </div>
      )}
    </SidePanelShell>
  );
}

function Options({ view, mainServiceId, canEdit }: { view: PackageView; mainServiceId: string; canEdit: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const remove = useAction((id: string) => catalogAdminService.deleteVariant(id), 'Option deleted');
  const publish = useAction(({ id, isActive }: { id: string; isActive: boolean }) => catalogAdminService.updateVariant(id, { isActive }), 'Saved');
  // An older package without options shows its base price to customers; staff add real options instead.
  const variants = view.variants.filter((variant) => variant.id || !canEdit);
  // A package keeps at least one option: the last one can be unpublished, not deleted.
  const isLastOption = variants.length <= 1;

  return (
    <section aria-label="Options">
      <p className="mb-[10px] text-[13px] font-semibold uppercase tracking-[0.6px] text-muted">অপশন বাছুন</p>
      <div className="grid grid-cols-2 gap-[14px]">
        {variants.map((variant) => (
          <VariantCard
            key={variant.id ?? variant.name}
            variant={variant}
            subService={view}
            mainServiceId={mainServiceId}
            staff={
              canEdit && variant.id
                ? {
                    canDelete: !isLastOption,
                    onDelete: () => {
                      if (window.confirm(`"${variant.name}" delete করবেন?`)) remove.mutate(variant.id!);
                    },
                    onPublish: (isActive) => publish.mutate({ id: variant.id!, isActive }),
                  }
                : undefined
            }
          />
        ))}
        {canEdit &&
          (isAdding ? (
            <VariantForm subServiceId={view.id} onDone={() => setIsAdding(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[14px] border-2 border-dashed border-secondary bg-secondary text-primary transition-colors hover:border-primary hover:bg-secondary"
            >
              <span className="btn-raised flex size-[44px] items-center justify-center rounded-full bg-primary text-white">
                <HugeiconsIcon icon={PlusSignIcon} size={22} strokeWidth={2} />
              </span>
              <span className="text-[15px] font-semibold">Add New</span>
            </button>
          ))}
      </div>
    </section>
  );
}

/* The package's own notes or disclaimer, under its options. Staff edit it in place; customers see it only when set. */
function PackageNotes({ view, canEdit }: { view: PackageView; canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const notes = view.packageDetails?.trim();
  if (!canEdit && !notes && !view.description) return null;

  return (
    <section className="rounded-[14px] border border-secondary bg-secondary p-[16px]">
      <div className="mb-[8px] flex items-center justify-between gap-[8px]">
        <p className="flex items-center gap-[8px] text-[15px] font-semibold text-ink">
          <HugeiconsIcon icon={InformationCircleIcon} size={20} className="text-primary" />
          এই প্যাকেজ সম্পর্কে
        </p>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsEditing((value) => !value)}
            className="flex cursor-pointer items-center gap-[4px] rounded-full px-[10px] py-[4px] text-[13px] font-semibold text-primary transition-colors hover:bg-secondary"
          >
            {isEditing ? (
              'Done'
            ) : (
              <>
                <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.8} /> Edit
              </>
            )}
          </button>
        )}
      </div>
      {isEditing ? (
        <DetailsTab kind="sub" id={view.id} details={view.packageDetails ?? ''} />
      ) : (
        <>
          {view.description && <p className="text-[14px] leading-relaxed text-ink">{view.description}</p>}
          {notes ? (
            <p className={`whitespace-pre-line text-[14px] leading-relaxed text-ink ${view.description ? 'mt-[8px] border-t border-secondary pt-[8px]' : ''}`}>{notes}</p>
          ) : (
            canEdit && <p className="text-[13px] text-muted">এই package-এর নিজস্ব details বা disclaimer এখনো লেখা হয়নি। Edit চেপে লিখুন।</p>
          )}
        </>
      )}
    </section>
  );
}

const iconButton = 'flex size-[30px] cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30';
const stepButton = 'flex size-[28px] cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30';

interface VariantCardProps {
  variant: OptionView;
  subService: PackageView;
  mainServiceId: string;
  /** Staff only: publish switch, edit, and delete (off for the last option). */
  staff?: { canDelete: boolean; onDelete: () => void; onPublish: (isActive: boolean) => void };
}

function VariantCard({ variant, subService, mainServiceId, staff }: VariantCardProps) {
  const addToCart = useCartStore((state) => state.add);
  const setCartQuantity = useCartStore((state) => state.setQuantity);
  const removeFromCart = useCartStore((state) => state.remove);
  const inCart = useCartStore((state) => state.carts[mainServiceId]?.find((line) => line.variantId === variant.id));
  const [quantity, setQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const isCountable = variant.priceUnit !== 'FIXED';
  const max = MAX_QUANTITY[variant.priceUnit] ?? 1;
  const price = Number(variant.price);
  const original = variant.originalPrice != null ? Number(variant.originalPrice) : null;
  const percentOff = original && original > price ? Math.round(((original - price) / original) * 100) : null;
  const unit = unitLabel(variant.priceUnit);
  const picture = variant.imageUrl ?? subService.imageUrl;
  const isPublished = variant.isActive !== false;

  if (isEditing && variant.id) return <VariantForm subServiceId={subService.id} variant={variant} onDone={() => setIsEditing(false)} />;

  const add = () => {
    if (!variant.id) {
      toast.error('এই অপশনটা এখন অর্ডার করা যাচ্ছে না।');
      return;
    }
    addToCart(mainServiceId, {
      variantId: variant.id,
      subServiceId: subService.id,
      subServiceName: subService.name,
      variantName: variant.name,
      unitPrice: price,
      priceUnit: variant.priceUnit,
      quantity: isCountable ? quantity : 1,
      imageUrl: picture ?? null,
    });
    toast.success(`${subService.name} (${variant.nameBn || variant.name}) কার্টে যোগ হয়েছে`);
  };
  // In the cart the stepper changes the cart itself; before that it only sets how many to add.
  const shown = inCart ? inCart.quantity : quantity;
  const change = (next: number) => {
    const value = Math.min(max, Math.max(1, next));
    if (inCart && variant.id) setCartQuantity(mainServiceId, variant.id, value);
    else setQuantity(value);
  };

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[14px] border bg-white transition-shadow hover:shadow-[0_4px_14px_rgba(32,41,57,0.08)] ${
        inCart ? 'border-primary ring-1 ring-primary/40' : 'border-line'
      }`}
    >
      <div className={`relative aspect-[4/3] w-full bg-gradient-to-br from-secondary via-secondary to-surface ${isPublished ? '' : 'opacity-50'}`}>
        {isImageSource(picture) ? (
          <Image src={picture!} alt="" fill sizes="260px" unoptimized className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center" aria-hidden>
            <span className="flex size-[56px] items-center justify-center rounded-full bg-white/80 text-primary shadow-sm">
              <HugeiconsIcon icon={Wrench01Icon} size={28} strokeWidth={1.6} />
            </span>
          </span>
        )}
        {percentOff !== null && (
          <span className="absolute left-[8px] top-[8px] rounded-full bg-primary px-[8px] py-[2px] text-[11px] font-bold text-white">{percentOff}% OFF</span>
        )}
        {inCart && (
          <span className="absolute right-[8px] top-[8px] flex items-center gap-[4px] rounded-full bg-primary px-[8px] py-[2px] text-[11px] font-bold text-white">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} strokeWidth={2.2} /> কার্টে
          </span>
        )}
        {!isPublished && <span className="absolute right-[8px] top-[8px] rounded-full bg-ink px-[8px] py-[2px] text-[11px] font-bold text-white">Unpublished</span>}
      </div>

      <div className="flex flex-1 flex-col gap-[6px] p-[12px]">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{variant.nameBn || variant.name}</p>
        <p className="flex flex-wrap items-baseline gap-x-[6px]">
          <span className="text-[18px] font-bold text-primary">{plainTaka(price)}</span>
          {original !== null && original > price && <span className="text-[13px] text-muted line-through">{plainTaka(original)}</span>}
          {unit && <span className="text-[12px] text-muted">{unit}</span>}
        </p>

        <div className="mt-auto flex items-center gap-[8px] pt-[6px]">
          {isCountable && (
            <div className="flex h-[34px] items-center rounded-full border border-line px-[2px]">
              <button type="button" aria-label="Fewer" disabled={shown <= 1} onClick={() => change(shown - 1)} className={stepButton}>
                <HugeiconsIcon icon={MinusSignIcon} size={14} strokeWidth={2} />
              </button>
              <span className="min-w-[20px] text-center text-[14px] font-semibold text-ink">{shown}</span>
              <button type="button" aria-label="More" disabled={shown >= max} onClick={() => change(shown + 1)} className={stepButton}>
                <HugeiconsIcon icon={PlusSignIcon} size={14} strokeWidth={2} />
              </button>
            </div>
          )}
          {inCart ? (
            <button
              type="button"
              onClick={() => {
                removeFromCart(mainServiceId, variant.id!);
                setQuantity(1);
              }}
              className="flex h-[34px] flex-1 cursor-pointer items-center justify-center gap-[4px] rounded-full border border-line text-[13px] font-semibold text-[#d64545] transition-colors hover:bg-[#fdecec]"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} /> সরান
            </button>
          ) : (
            <button
              type="button"
              onClick={add}
              disabled={!isPublished}
              className="h-[34px] flex-1 cursor-pointer rounded-full bg-primary text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {staff && (
        <div className="flex items-center justify-between gap-[6px] border-t border-line bg-surface px-[10px] py-[6px]">
          <PublishToggle isPublished={isPublished} onChange={staff.onPublish} />
          <div className="flex items-center gap-[2px]">
            <button type="button" aria-label={`Edit ${variant.name}`} onClick={() => setIsEditing(true)} className={iconButton}>
              <HugeiconsIcon icon={PencilEdit01Icon} size={17} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              aria-label={`Delete ${variant.name}`}
              disabled={!staff.canDelete}
              title={staff.canDelete ? undefined : 'একটা option থাকতেই হবে। লুকাতে চাইলে Unpublish করুন।'}
              onClick={staff.onDelete}
              className={iconButton}
            >
              <HugeiconsIcon icon={Delete02Icon} size={17} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

const fieldClass = 'w-full rounded-[6px] border border-line px-[8px] py-[6px] text-[14px] text-ink outline-none focus:border-primary';
const UNITS: Array<{ value: PriceUnit; label: string }> = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'PER_UNIT', label: '/ per' },
  { value: 'PER_SQFT', label: '/ sqft' },
];

/* Staff only: one option's name, price, old price and unit, in the card's place. Without a variant it adds a new one. */
function VariantForm({ subServiceId, variant, onDone }: { subServiceId: string; variant?: CatalogVariant; onDone: () => void }) {
  const [name, setName] = useState(variant?.name ?? '');
  const [price, setPrice] = useState(variant ? String(Number(variant.price)) : '');
  const [originalPrice, setOriginalPrice] = useState(variant?.originalPrice != null ? String(Number(variant.originalPrice)) : '');
  const [priceUnit, setPriceUnit] = useState<PriceUnit>(variant?.priceUnit ?? 'FIXED');
  const body = { name: name.trim(), price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : null, priceUnit };
  const save = useAction(
    () => (variant?.id ? catalogAdminService.updateVariant(variant.id, body) : catalogAdminService.createVariant({ ...body, serviceId: subServiceId })),
    variant ? 'Option saved' : 'Option added',
  );
  const isValid = name.trim() !== '' && price !== '' && Number(price) >= 0;

  return (
    <form
      className="flex flex-col gap-[6px] rounded-[14px] border border-primary bg-white p-[12px]"
      onSubmit={(event) => {
        event.preventDefault();
        if (isValid) save.mutate(undefined, { onSuccess: onDone });
      }}
    >
      <p className="text-[14px] font-semibold text-ink">{variant ? 'Edit option' : 'New option'}</p>
      <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="নাম (যেমন: 1 - 1.5 Ton)" className={fieldClass} />
      <input value={price} onChange={(event) => setPrice(event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="দাম" className={fieldClass} />
      <input value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="আগের দাম (optional)" className={fieldClass} />
      <select value={priceUnit} onChange={(event) => setPriceUnit(event.target.value as PriceUnit)} className={fieldClass}>
        {UNITS.map((unit) => (
          <option key={unit.value} value={unit.value}>
            {unit.label}
          </option>
        ))}
      </select>
      <div className="mt-[4px] flex gap-[6px]">
        <button type="submit" disabled={!isValid || save.isPending} className="flex-1 cursor-pointer rounded-[6px] bg-primary py-[6px] text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-primary-disabled">
          {save.isPending ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onDone} className="flex-1 cursor-pointer rounded-[6px] border border-line py-[6px] text-[13px] font-semibold text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
