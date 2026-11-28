'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckmarkCircle02Icon, Layers01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { ScheduleSection } from '@/components/modals/place-order/ScheduleSection';
import { FormPart } from '@/components/modals/place-order/FormPart';
import { OrderSelect } from '@/components/modals/place-order/OrderField';
import { orderErrorMessage, useOrderPlaceFields } from '@/hooks/useOrderPlaceFields';
import { catalogService } from '@/services/catalog.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Order } from '@/types/order.types';

interface CustomOrderPanelProps {
  /** The main service whose chat is open; the customer may pick another. */
  mainServiceId: string;
  onClose: () => void;
  onPlaced: (order: Order) => void;
}

/*
 * The Custom card's form: a problem the list does not have. The customer picks the category and main service,
 * describes the problem in words (no photos), says where and when. The visit is free; the provider sends a price
 * after it, and the work goes ahead only if the customer accepts that price.
 */
export function CustomOrderPanel({ mainServiceId, onClose, onPlaced }: CustomOrderPanelProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const place = useOrderPlaceFields();
  const [chosenMainServiceId, setChosenMainServiceId] = useState(mainServiceId);
  const [groupChoice, setGroupChoice] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: groups = [] } = useQuery({ queryKey: ['catalog-groups'], queryFn: catalogService.getGroups, staleTime: 60_000 });
  const { data: mainServices = [] } = useQuery({ queryKey: ['catalog-main-services-all'], queryFn: () => catalogService.getMainServices(), staleTime: 60_000 });
  const groupId = groupChoice ?? mainServices.find((main) => main.id === chosenMainServiceId)?.groupId ?? null;
  const mainOptions = mainServices.filter((main) => !groupId || main.groupId === groupId);

  const isProblemDone = Boolean(chosenMainServiceId && description.trim().length >= 5);
  const missing = [!chosenMainServiceId && 'সার্ভিস', description.trim().length < 5 && 'সমস্যার বর্ণনা', ...place.missingFields].filter(Boolean);

  const submit = async () => {
    if (!place.values || !isProblemDone) return;
    setIsSubmitting(true);
    try {
      const { order } = await catalogService.placeCustom({ ...place.values, categoryId: chosenMainServiceId, description: description.trim() });
      authService.getMe().then(setUser).catch(() => undefined);
      onPlaced(order);
    } catch (error) {
      toast.error(orderErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidePanelShell title="Custom Request" onClose={onClose}>
      <div className="pb-[24px]">
        <div className="text-[13px] leading-relaxed text-ink">
          লিস্টে আপনার সমস্যা নেই? লিখে পাঠান। প্রোভাইডার এসে দেখে দাম জানাবে, <b>ভিজিট ফ্রি</b>। দাম Accept করলে কাজ শুরু হবে, Reject করলে কোনো চার্জ নেই।
        </div>

        <FormPart step={1} title="সমস্যা" hint="কী হয়েছে" isDone={isProblemDone}>
          <OrderSelect
            icon={Layers01Icon}
            placeholder="ক্যাটাগরি"
            value={groupId}
            options={groups.map((group) => ({ value: group.id, label: group.nameBn || group.name }))}
            onChange={(value) => {
              setGroupChoice(value ? String(value) : null);
              setChosenMainServiceId('');
            }}
          />
          <OrderSelect
            icon={CheckmarkCircle02Icon}
            placeholder="মেইন সার্ভিস"
            value={chosenMainServiceId || null}
            options={mainOptions.map((main) => ({ value: main.id, label: main.name }))}
            onChange={(value) => setChosenMainServiceId(value ? String(value) : '')}
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="সমস্যাটা বিস্তারিত লিখুন (যেমন: এসি চালু হয় কিন্তু ঠান্ডা হয় না, আউটডোর থেকে শব্দ হয়)"
            className="mt-[14px] w-full resize-none rounded-[8px] border border-line p-[10px] text-[14px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </FormPart>

        <ScheduleSection state={place.state} />

        <div className="mt-[28px] flex justify-center">
          <button
            type="button"
            onClick={submit}
            disabled={!place.values || !isProblemDone || isSubmitting}
            className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {isSubmitting ? 'Sending...' : 'Send Request & Chat'}
          </button>
        </div>
        {missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-muted">বাকি আছে: {missing.join(', ')}</p>}
      </div>
    </SidePanelShell>
  );
}
