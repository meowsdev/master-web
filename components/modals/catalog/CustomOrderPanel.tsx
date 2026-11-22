'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, CheckmarkCircle02Icon, ImageAdd02Icon, Layers01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { ScheduleSection } from '@/components/modals/place-order/ScheduleSection';
import { FormPart } from '@/components/modals/place-order/FormPart';
import { OrderSelect } from '@/components/modals/place-order/OrderField';
import { orderErrorMessage, useOrderPlaceFields } from '@/hooks/useOrderPlaceFields';
import { apiClient } from '@/lib/axios';
import { API_BASE_URL } from '@/lib/api-config';
import { catalogService } from '@/services/catalog.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Order } from '@/types/order.types';

/** Uploads are served by the API host, outside its /api/v1 prefix. */
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

interface CustomOrderPanelProps {
  /** The main service whose chat is open; the customer may pick another. */
  mainServiceId: string;
  onClose: () => void;
  onPlaced: (order: Order) => void;
}

const MAX_IMAGES = 5;

/*
 * The Custom card's form: a problem the list does not have. The customer picks the category and main service,
 * describes the problem (photos optional), says where and when. The visit is free; the provider sends a price
 * after it, and the work goes ahead only if the customer accepts that price.
 */
export function CustomOrderPanel({ mainServiceId, onClose, onPlaced }: CustomOrderPanelProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const place = useOrderPlaceFields();
  const [chosenMainServiceId, setChosenMainServiceId] = useState(mainServiceId);
  const [groupChoice, setGroupChoice] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: groups = [] } = useQuery({ queryKey: ['catalog-groups'], queryFn: catalogService.getGroups, staleTime: 60_000 });
  const { data: mainServices = [] } = useQuery({ queryKey: ['catalog-main-services-all'], queryFn: () => catalogService.getMainServices(), staleTime: 60_000 });
  const groupId = groupChoice ?? mainServices.find((main) => main.id === chosenMainServiceId)?.groupId ?? null;
  const mainOptions = mainServices.filter((main) => !groupId || main.groupId === groupId);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_IMAGES - imageUrls.length;
    if (room <= 0) return toast.info(`সর্বোচ্চ ${MAX_IMAGES}টি ছবি`);
    const form = new FormData();
    Array.from(files)
      .slice(0, room)
      .forEach((file) => form.append('images', file));
    setIsUploading(true);
    try {
      const { data } = await apiClient.post<{ urls: string[] }>('/uploads/order-images', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageUrls((previous) => [...previous, ...data.urls].slice(0, MAX_IMAGES));
    } catch (error) {
      toast.error(orderErrorMessage(error, 'ছবি আপলোড হয়নি'));
    } finally {
      setIsUploading(false);
    }
  };

  const isProblemDone = Boolean(chosenMainServiceId && description.trim().length >= 5);
  const missing = [!chosenMainServiceId && 'সার্ভিস', description.trim().length < 5 && 'সমস্যার বর্ণনা', ...place.missingFields].filter(Boolean);

  const submit = async () => {
    if (!place.values || !isProblemDone) return;
    setIsSubmitting(true);
    try {
      const { order } = await catalogService.placeCustom({ ...place.values, imageUrls, categoryId: chosenMainServiceId, description: description.trim() });
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
        <div className="rounded-[12px] bg-[#e7fce3] p-[12px] text-[13px] leading-relaxed text-[#15803d]">
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
            className="mt-[14px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[10px] text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#9aa4b2] focus:border-[#1daa61]"
          />

          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            {imageUrls.map((url) => (
              <div key={url} className="relative size-[64px] overflow-hidden rounded-[8px] border border-[#e5e5e5]">
                {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files are served by the API host */}
                <img src={`${API_ORIGIN}${url}`} alt="" className="size-full object-cover" />
                <button type="button" aria-label="Remove photo" onClick={() => setImageUrls((previous) => previous.filter((item) => item !== url))} className="absolute right-[2px] top-[2px] cursor-pointer rounded-full bg-white/90 p-[2px]">
                  <HugeiconsIcon icon={Cancel01Icon} size={12} />
                </button>
              </div>
            ))}
            {imageUrls.length < MAX_IMAGES && (
              <label className={`flex size-[64px] cursor-pointer flex-col items-center justify-center gap-[2px] rounded-[8px] border border-dashed border-[#9fd8b4] text-[11px] text-[#1daa61] ${isUploading ? 'opacity-50' : ''}`}>
                <HugeiconsIcon icon={ImageAdd02Icon} size={20} />
                {isUploading ? '...' : 'ছবি'}
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" disabled={isUploading} onChange={(event) => upload(event.target.files)} />
              </label>
            )}
          </div>
        </FormPart>

        <ScheduleSection state={place.state} />

        <div className="mt-[28px] flex justify-center">
          <button
            type="button"
            onClick={submit}
            disabled={!place.values || !isProblemDone || isSubmitting || isUploading}
            className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Request & Chat'}
          </button>
        </div>
        {missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-[#697586]">বাকি আছে: {missing.join(', ')}</p>}
      </div>
    </SidePanelShell>
  );
}
