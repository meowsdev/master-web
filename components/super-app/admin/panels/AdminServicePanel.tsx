'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert02Icon, CalculatorIcon, Note01Icon, Time02Icon, Wallet01Icon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderField, OrderSelect, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { PicturePicker } from '../PicturePicker';
import { AdminServiceInput, adminService } from '@/services/admin.service';
import { servicesService } from '@/services/services.service';
import { VariantsEditor } from './AdminCatalogPanel';
import { useAdminCatalog } from '../useAdminCatalog';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { PriceUnit, Service } from '@/types/service.types';

/** Countable services let the customer pick how many (2 ACs = 2 x base price) when ordering. */
const PRICE_UNIT_OPTIONS: Array<{ value: PriceUnit; label: string }> = [
  { value: 'FIXED', label: 'Not countable (one fixed job)' },
  { value: 'PER_UNIT', label: 'Countable: per unit' },
  { value: 'PER_SQFT', label: 'Countable: per sq ft' },
];

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'The service could not be saved';
};

function Toggle({ label, isOn, onChange }: { label: string; isOn: boolean; onChange: (isOn: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-[8px] text-[14px] font-semibold text-ink">
      <input type="checkbox" checked={isOn} onChange={(event) => onChange(event.target.checked)} className="size-[18px] accent-primary" />
      {label}
    </label>
  );
}

interface AdminServicePanelProps {
  /** The service being edited, or null to create a new one. */
  service: Service | null;
  /** A new service starts under this main service (set right after one is created). */
  defaultCategoryId?: string;
  onClose: () => void;
}

/*
 * Create or edit one service, in the right-hand panel. Every rule (who may do it, valid price, valid image link) is checked by the
 * backend; the form only collects the fields. Mount it with a key so switching service starts a fresh form.
 */
export function AdminServicePanel({ service, defaultCategoryId, onClose }: AdminServicePanelProps) {
  const queryClient = useQueryClient();
  const openPanel = useOrderPanelStore((state) => state.open);
  const { data: categories = [] } = useQuery({ queryKey: ['admin-categories'], queryFn: servicesService.getCategories });

  const [categoryId, setCategoryId] = useState(service?.categoryId ?? defaultCategoryId ?? '');
  const [name, setName] = useState(service?.name ?? '');
  const [nameBn, setNameBn] = useState(service?.nameBn ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [basePrice, setBasePrice] = useState(service ? String(Number(service.basePrice)) : '');
  const [durationMin, setDurationMin] = useState(service?.durationMin ? String(service.durationMin) : '');
  const [imageUrl, setImageUrl] = useState(service?.imageUrl ?? '');
  const [featuresText, setFeaturesText] = useState((service?.features ?? []).join('\n'));
  const [isFixedPrice, setIsFixedPrice] = useState(service?.isFixedPrice ?? false);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>(service?.priceUnit ?? 'FIXED');
  const [isPopular, setIsPopular] = useState(service?.isPopular ?? false);
  const [isFeatured, setIsFeatured] = useState(service?.isFeatured ?? false);

  const price = Number(basePrice);
  const isReady = Boolean(categoryId && name.trim() && description.trim() && basePrice !== '' && price >= 0);

  const save = useMutation({
    mutationFn: async () => {
      const input: AdminServiceInput = {
        categoryId,
        name: name.trim(),
        nameBn: nameBn.trim(),
        description: description.trim(),
        basePrice: price,
        durationMin: durationMin ? Number(durationMin) : undefined,
        // An empty picture is left out when there was none, and cleared (null) when it was removed.
        imageUrl: imageUrl.trim() || (service?.imageUrl ? null : undefined),
        features: featuresText.split('\n').map((line) => line.trim()).filter(Boolean),
        isFixedPrice,
        priceUnit,
        isPopular,
        isFeatured,
      };
      return service ? adminService.updateService(service.id, input).then(() => service.id) : adminService.createService(input).then((created) => created.id);
    },
    onSuccess: (savedId) => {
      toast.success(service ? 'Service saved' : 'Service created');
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['order-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['admin-catalog-tree'] });
      queryClient.invalidateQueries({ queryKey: ['admin-catalog-ungrouped'] });
      // After creating, the panel stays open on the new service so it can be refined.
      openPanel(savedId, 'adminService');
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <SidePanelShell title={service ? service.nameBn || service.name : 'New service'} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="pb-[24px]"
      >
          <OrderSelect icon={Wrench01Icon} placeholder="Main service (category)" value={categoryId || null} options={categories.map((category) => ({ value: category.id, label: category.name }))} onChange={setCategoryId} />

          <OrderField icon={Note01Icon}>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Service name" className={fieldControlClass} />
          </OrderField>
          <OrderField icon={Note01Icon}>
            <input value={nameBn} onChange={(event) => setNameBn(event.target.value)} maxLength={150} placeholder="বাংলা নাম (optional)" className={fieldControlClass} />
          </OrderField>
          <OrderField icon={Alert02Icon}>
            <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={255} placeholder="Short description" className={fieldControlClass} />
          </OrderField>

          <div className="flex gap-[16px]">
            <div className="min-w-0 flex-1">
              <OrderField icon={Wallet01Icon}>
                <input inputMode="numeric" value={basePrice} onChange={(event) => setBasePrice(event.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="Base price (৳)" className={fieldControlClass} />
              </OrderField>
            </div>
            <div className="min-w-0 flex-1">
              <OrderField icon={Time02Icon}>
                <input inputMode="numeric" value={durationMin} onChange={(event) => setDurationMin(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Duration (minutes)" className={fieldControlClass} />
              </OrderField>
            </div>
          </div>

          <OrderSelect icon={CalculatorIcon} placeholder="Countable?" value={priceUnit} options={PRICE_UNIT_OPTIONS} onChange={(value) => value && setPriceUnit(value as PriceUnit)} />

          <PicturePicker value={imageUrl} onChange={setImageUrl} />
          <OrderField icon={Note01Icon}>
            <textarea value={featuresText} onChange={(event) => setFeaturesText(event.target.value)} rows={3} placeholder="Features, one per line" className={`${fieldControlClass} resize-none`} />
          </OrderField>

          <div className="mt-[20px] flex flex-wrap gap-x-[24px] gap-y-[10px]">
            <Toggle label="Fixed price" isOn={isFixedPrice} onChange={setIsFixedPrice} />
            <Toggle label="Popular" isOn={isPopular} onChange={setIsPopular} />
            <Toggle label="Featured" isOn={isFeatured} onChange={setIsFeatured} />
          </div>

          <div className="mt-[28px] flex justify-center">
            <button type="submit" disabled={!isReady || save.isPending} className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled">
              {save.isPending ? 'Saving...' : service ? 'Save changes' : 'Create service'}
            </button>
          </div>
      </form>
      {service && <ServiceContentSection serviceId={service.id} />}
    </SidePanelShell>
  );
}

/* The priced options of this sub-service. Overview, FAQ, How to order, Review and Details belong to its main service. */
function ServiceContentSection({ serviceId }: { serviceId: string }) {
  const { mains } = useAdminCatalog();
  const main = mains.find((item) => item.services.some((sub) => sub.id === serviceId));
  const sub = main?.services.find((item) => item.id === serviceId);
  if (!main || !sub) return null;

  return (
    <div className="flex flex-col gap-[16px] pb-[24px]">
      <section className="flex flex-col gap-[10px] rounded-[16px] bg-surface p-[14px]">
        <div>
          <p className="text-[15px] font-semibold text-ink">Options ও দাম</p>
          <p className="text-[12px] text-muted">কাস্টমার এগুলো থেকে বেছে কার্টে যোগ করে।</p>
        </div>
        <VariantsEditor sub={sub} />
      </section>
    </div>
  );
}
