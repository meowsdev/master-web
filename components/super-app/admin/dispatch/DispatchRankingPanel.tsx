'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Location01Icon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderSelect } from '@/components/modals/place-order/OrderField';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { orderPlacementService } from '@/services/order-placement.service';
import {
  DispatchPreview,
  DispatchSettings,
  RANKING_FACTORS,
  RankingFactor,
  RankingPresetId,
  RankingWeights,
  dispatchRankingService,
} from '@/services/dispatch-ranking.service';
import { ChipRow } from '../../ChipRow';

const FACTOR_TEXT: Record<RankingFactor, { title: string; hint: string }> = {
  responseRate: { title: '⚡ রেসপন্স রেট', hint: 'গত ৬০ দিনে কত অফারের সময়মতো উত্তর দিয়েছে' },
  responseSpeed: { title: '⏱ রেসপন্সের গতি', hint: 'অফার পেয়ে কত দ্রুত উত্তর দেয়' },
  successScore: { title: '✅ কাজের মান', hint: 'ঠিকমতো শেষ, কোয়ালিটি রিভিশন নেই, বাতিল কম (Success Score)' },
  rating: { title: '⭐ কাস্টমার রেটিং', hint: 'পাবলিক রিভিউয়ের গড়' },
  behaviour: { title: '🤝 প্ল্যাটফর্মের সাথে আচরণ', hint: 'Due সময়মতো দেয়; negative wallet বা রিমাইন্ডারে কমে' },
  level: { title: '🏅 লেভেল', hint: 'Level 0 থেকে Top Rated' },
  experience: { title: '📦 অভিজ্ঞতা', hint: 'মোট সম্পন্ন অর্ডার (৫০টিতে পুরো নম্বর)' },
  workload: { title: '⚖️ কাজের চাপ', hint: 'এখন কম চলমান অর্ডার থাকলে আগে পায়, কাজ সবার মধ্যে ছড়ায়' },
  newcomer: { title: '🌱 নতুনদের সুযোগ', hint: '৫টির কম অর্ডার করা নতুন প্রোভাইডারকে একটু এগিয়ে রাখে' },
};

const PRESETS: ReadonlyArray<{ id: RankingPresetId | 'CUSTOM'; label: string }> = [
  { id: 'BALANCED', label: 'ভারসাম্য' },
  { id: 'RESPONSE_FIRST', label: 'রেসপন্স আগে' },
  { id: 'QUALITY_FIRST', label: 'মান আগে' },
  { id: 'FAIR_SHARE', label: 'সবাইকে সুযোগ' },
  { id: 'CUSTOM', label: 'নিজের মতো' },
];

const primaryButton = 'h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';
const secondaryButton = 'h-[40px] cursor-pointer rounded-[10px] border border-chip bg-white px-[16px] text-[14px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50';
const sectionTitle = 'mb-[8px] mt-[20px] text-[13px] font-semibold uppercase tracking-[0.4px] text-muted';

const sameWeights = (a: RankingWeights, b: RankingWeights) => RANKING_FACTORS.every((factor) => a[factor] === b[factor]);
const apiError = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/*
 * Admin: how new orders are shared out among providers. Off, they go by rating as before. On, every eligible
 * provider gets a 0-100 dispatch score from nine factors, each counted as much as its weight here, and the best
 * are offered the order first. The preview shows, before saving, who would be asked first for a service and place.
 */
export function DispatchRankingPanel({ adminId, onClose }: { adminId: string; onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({ queryKey: ['admin-dispatch-ranking', adminId], queryFn: dispatchRankingService.get });

  return (
    <SidePanelShell title="অর্ডার বণ্টনের নিয়ম" onClose={onClose}>
      {isLoading && <p className="text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">সেটিং লোড করা যায়নি।</p>}
      {/* Keyed by the saved values, so the form starts from them again after every save. */}
      {data && <RankingForm key={JSON.stringify([data.isEnabled, data.weights])} adminId={adminId} saved={data} />}
    </SidePanelShell>
  );
}

function RankingForm({ adminId, saved }: { adminId: string; saved: DispatchSettings }) {
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(saved.isEnabled);
  const [weights, setWeights] = useState<RankingWeights>(saved.weights);
  const totalWeight = RANKING_FACTORS.reduce((sum, factor) => sum + weights[factor], 0);
  const activePreset = (Object.keys(saved.presets) as RankingPresetId[]).find((id) => sameWeights(saved.presets[id], weights)) ?? 'CUSTOM';
  const isChanged = isEnabled !== saved.isEnabled || !sameWeights(weights, saved.weights);

  const save = useMutation({
    mutationFn: () => dispatchRankingService.update({ isEnabled, weights }),
    onSuccess: (result) => {
      toast.success(result.isEnabled ? 'সেভ হয়েছে। নতুন অর্ডার এখন স্কোর অনুযায়ী যাবে।' : 'সেভ হয়েছে। নতুন অর্ডার রেটিং অনুযায়ী যাবে (আগের নিয়ম)।');
      void queryClient.invalidateQueries({ queryKey: ['admin-dispatch-ranking', adminId] });
    },
    onError: (error) => toast.error(apiError(error, 'সেভ করা যায়নি।')),
  });
  const refresh = useMutation({
    mutationFn: dispatchRankingService.refresh,
    onSuccess: (result) => toast.success(`${result.refreshed} জন প্রোভাইডারের হিসাব হালনাগাদ হয়েছে${result.failed ? `, ${result.failed} জনের হয়নি` : ''}।`),
    onError: (error) => toast.error(apiError(error, 'হালনাগাদ করা যায়নি।')),
  });

  return (
    <div className="pb-[24px]">
      {/* The master switch: off = the old rule, so a problem is one click from undone. */}
      <section className={`rounded-[14px] p-[14px] ${isEnabled ? 'bg-secondary/50' : 'bg-surface'}`}>
        <div className="flex items-center justify-between gap-[12px]">
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold text-ink">স্কোর অনুযায়ী বণ্টন</span>
            <span className="text-[12px] font-medium text-muted">
              {isEnabled ? 'চালু: সেরা স্কোরের প্রোভাইডার আগে অফার পায়' : 'বন্ধ: রেটিং অনুযায়ী আগের নিয়মে যাচ্ছে'}
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => setIsEnabled((value) => !value)}
            className="relative h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full"
            title={isEnabled ? 'চাপলে বন্ধ হবে (সেভ করতে হবে)' : 'চাপলে চালু হবে (সেভ করতে হবে)'}
          >
            <span className={`absolute inset-0 rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted/40'}`} />
            <span className={`absolute top-[3px] size-[16px] rounded-full bg-white shadow transition-all ${isEnabled ? 'left-[21px]' : 'left-[3px]'}`} />
          </button>
        </div>
        <p className="mt-[8px] text-[12px] font-medium leading-relaxed text-muted">
          এলাকা, সার্ভিস আর একাউন্টের নিয়ম আগের মতোই; শুধু কে আগে অফার পাবে সেই ক্রম বদলায়। একবারে ৫ জন অফার পায়, কেউ না নিলে পরের ৫ জন।
        </p>
      </section>

      <p className={sectionTitle}>কোন বিষয়ে কতটা গুরুত্ব</p>
      <ChipRow
        chips={PRESETS}
        activeId={activePreset}
        onSelect={(id) => id !== 'CUSTOM' && setWeights(saved.presets[id])}
        label="Ranking presets"
        rowClassName="px-0 pb-[12px] pt-0"
      />

      <ul className="flex flex-col gap-[12px]">
        {RANKING_FACTORS.map((factor) => {
          const share = totalWeight > 0 ? Math.round((weights[factor] / totalWeight) * 100) : 0;
          return (
            <li key={factor} className={`rounded-[12px] border border-line bg-white p-[12px] ${weights[factor] === 0 ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-[12px]">
                <span className="flex min-w-0 flex-col">
                  <span className="text-[14px] font-semibold text-ink">{FACTOR_TEXT[factor].title}</span>
                  <span className="text-[12px] font-medium text-muted">{FACTOR_TEXT[factor].hint}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[16px] font-semibold text-ink">{weights[factor]}</span>
                  <span className="block text-[11px] font-medium text-muted">{weights[factor] === 0 ? 'বাদ' : `${share}%`}</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={weights[factor]}
                onChange={(event) => setWeights((current) => ({ ...current, [factor]: Number(event.target.value) }))}
                aria-label={FACTOR_TEXT[factor].title}
                className="mt-[8px] w-full cursor-pointer accent-primary"
              />
            </li>
          );
        })}
      </ul>
      {totalWeight === 0 && <p className="mt-[8px] text-[12px] font-medium text-[#b7791f]">সব গুরুত্ব ০: সবার স্কোর সমান হবে, ক্রম রেটিং অনুযায়ী থাকবে।</p>}

      <div className="mt-[16px] flex flex-wrap gap-[8px]">
        <button type="button" disabled={!isChanged || save.isPending} onClick={() => save.mutate()} className={primaryButton}>
          {save.isPending ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
        <button type="button" disabled={refresh.isPending} onClick={() => refresh.mutate()} className={secondaryButton}>
          {refresh.isPending ? 'হিসাব হচ্ছে...' : 'প্রোভাইডারদের হিসাব এখনই হালনাগাদ'}
        </button>
      </div>
      <p className="mt-[8px] text-[12px] font-medium text-muted">প্রোভাইডারদের সংখ্যাগুলো (রেসপন্স, মান, আচরণ…) চালু থাকলে প্রতি ১৫ মিনিটে নিজে থেকে হালনাগাদ হয়।</p>

      <p className={sectionTitle}>প্রিভিউ: কে আগে অফার পাবে</p>
      <RankingPreview weights={weights} />
    </div>
  );
}

/* Who would be asked first for a service and place, with the weights on screen (saved or not). */
function RankingPreview({ weights }: { weights: RankingWeights }) {
  const [categoryId, setCategoryId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [upazilaId, setUpazilaId] = useState<number | null>(null);
  const { data: catalog } = useQuery({ queryKey: ['order-catalog'], queryFn: orderPlacementService.getCatalog, staleTime: 60_000 });
  const { districts, upazilas } = useLocationOptions(districtId);
  const category = catalog?.categories.find((item) => item.id === categoryId);

  const preview = useMutation({
    mutationFn: () =>
      dispatchRankingService.preview({ serviceId, weights, ...(districtId && upazilaId ? { districtId, upazilaId } : {}) }),
    onError: (error) => toast.error(apiError(error, 'প্রিভিউ আনা যায়নি।')),
  });

  return (
    <div className="rounded-[12px] border border-line bg-white p-[12px]">
      <OrderSelect
        icon={Wrench01Icon}
        placeholder="মেইন সার্ভিস"
        value={categoryId}
        options={(catalog?.categories ?? []).map((item) => ({ value: item.id, label: item.name }))}
        onChange={(value) => {
          setCategoryId(value);
          setServiceId('');
        }}
      />
      <OrderSelect
        icon={Wrench01Icon}
        placeholder="সাব-সার্ভিস"
        value={serviceId}
        disabled={!category}
        options={(category?.services ?? []).map((item) => ({ value: item.id, label: item.nameBn || item.name }))}
        onChange={setServiceId}
      />
      <OrderSelect
        icon={Location01Icon}
        placeholder="জেলা (ঐচ্ছিক)"
        value={districtId ? String(districtId) : ''}
        options={districts.map((item) => ({ value: String(item.id), label: item.bnName || item.name }))}
        onChange={(value) => {
          setDistrictId(value ? Number(value) : null);
          setUpazilaId(null);
        }}
      />
      <OrderSelect
        icon={Location01Icon}
        placeholder="উপজেলা (ঐচ্ছিক)"
        value={upazilaId ? String(upazilaId) : ''}
        disabled={!districtId}
        options={upazilas.map((item) => ({ value: String(item.id), label: item.bnName || item.name }))}
        onChange={(value) => setUpazilaId(value ? Number(value) : null)}
      />
      <button type="button" disabled={!serviceId || preview.isPending} onClick={() => preview.mutate()} className={`${primaryButton} mt-[12px] w-full`}>
        {preview.isPending ? 'হিসাব হচ্ছে...' : 'প্রিভিউ দেখুন'}
      </button>
      {preview.data && <PreviewList preview={preview.data} />}
    </div>
  );
}

function PreviewList({ preview }: { preview: DispatchPreview }) {
  if (preview.providers.length === 0) {
    return <p className="mt-[12px] text-center text-[13px] font-medium text-muted">এই সার্ভিস আর এলাকায় অফার পাওয়ার মতো কোনো প্রোভাইডার নেই।</p>;
  }
  return (
    <div className="mt-[12px]">
      {preview.area === 'DISTRICT' && <p className="mb-[8px] text-[12px] font-medium text-[#b7791f]">উপজেলায় কেউ নেই, তাই জেলার প্রোভাইডাররা দেখানো হচ্ছে।</p>}
      <ol className="flex flex-col gap-[8px]">
        {preview.providers.map((provider) => {
          const top = provider.parts
            ? RANKING_FACTORS.filter((factor) => (provider.parts?.[factor] ?? 0) > 0)
                .sort((a, b) => (provider.parts?.[b] ?? 0) - (provider.parts?.[a] ?? 0))
                .slice(0, 3)
            : [];
          return (
            <li key={provider.providerId} className={`rounded-[10px] p-[10px] ${provider.wave === 1 ? 'bg-secondary/40' : 'bg-surface'}`}>
              <div className="flex items-center justify-between gap-[8px]">
                <span className="flex min-w-0 items-center gap-[8px]">
                  <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-ink">{provider.position}</span>
                  <span className="truncate text-[14px] font-semibold text-ink">{provider.name}</span>
                </span>
                <span className="shrink-0 text-[14px] font-semibold text-primary">{provider.score === null ? '—' : provider.score}</span>
              </div>
              <div className="mt-[6px] h-[6px] overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-primary" style={{ width: `${provider.score ?? 50}%` }} />
              </div>
              <p className="mt-[6px] text-[11px] font-medium text-muted">
                {provider.wave === 1 ? 'প্রথম দলে অফার পাবে' : `${provider.wave} নম্বর দলে`}
                {provider.score === null && ' · এখনো হিসাব হয়নি (মাঝামাঝি ধরা হয়েছে)'}
                {top.length > 0 && ` · ${top.map((factor) => `${FACTOR_TEXT[factor].title.split(' ').slice(1).join(' ')} ${Math.round(provider.parts?.[factor] ?? 0)}`).join(', ')}`}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
