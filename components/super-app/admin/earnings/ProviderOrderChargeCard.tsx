'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { platformSettingsService, ProviderOrderCharge } from '@/services/platform-settings.service';

const QUERY_KEY = ['admin-provider-order-charge'];

/*
 * Admin only: the platform charge on orders a provider creates for their own customer. One rule for every
 * provider, 10% unless changed. A change applies to new orders; running orders keep the percent they started with.
 */
export function ProviderOrderChargeCard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: QUERY_KEY, queryFn: platformSettingsService.getProviderOrderCharge });
  const save = useMutation({
    mutationFn: platformSettingsService.setProviderOrderCharge,
    onSuccess: (saved) => {
      queryClient.setQueryData(QUERY_KEY, saved);
      toast.success(saved.enabled ? `প্রোভাইডারের অর্ডারে চার্জ ${saved.rate}%` : 'প্রোভাইডারের অর্ডারে কোনো চার্জ নেওয়া হবে না');
    },
    onError: () => toast.error('সেভ করা যায়নি, আবার চেষ্টা করুন।'),
  });

  if (isLoading) return null;
  if (isError || !data) return <p className="mt-[8px] text-[12px] font-medium text-[#d64545]">প্রোভাইডার অর্ডারের চার্জ লোড করা যায়নি।</p>;
  // Keyed by the saved value, so the % box starts from it again after every save.
  return <ChargeForm key={`${data.enabled}-${data.rate}`} saved={data} isSaving={save.isPending} onSave={(next) => save.mutate(next)} />;
}

function ChargeForm({ saved, isSaving, onSave }: { saved: ProviderOrderCharge; isSaving: boolean; onSave: (next: ProviderOrderCharge) => void }) {
  const [rateText, setRateText] = useState(String(saved.rate));
  const rate = Number(rateText);
  const isRateValid = rateText.trim() !== '' && Number.isFinite(rate) && rate >= 0 && rate <= 100;
  const isRateChanged = isRateValid && rate !== saved.rate;

  return (
    <div className="rounded-[12px] border border-line bg-white p-[14px]">
      <div className="flex items-center justify-between gap-[12px]">
        <span className="flex flex-col">
          <span className="text-[14px] font-semibold text-ink">প্রোভাইডারের নিজের অর্ডারে চার্জ</span>
          <span className="text-[12px] font-medium text-muted">{saved.enabled ? `চালু · ${saved.rate}%` : 'বন্ধ · কোনো চার্জ নেই'}</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={saved.enabled}
          disabled={isSaving}
          onClick={() => onSave({ enabled: !saved.enabled, rate: saved.rate })}
          className="relative h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          title={saved.enabled ? 'চাপলে চার্জ বন্ধ হবে' : 'চাপলে চার্জ চালু হবে'}
        >
          <span className={`absolute inset-0 rounded-full ${saved.enabled ? 'bg-primary' : 'bg-muted/40'}`} />
          <span className={`absolute top-[3px] size-[16px] rounded-full bg-white shadow transition-all ${saved.enabled ? 'left-[21px]' : 'left-[3px]'}`} />
        </button>
      </div>

      {saved.enabled && (
        <div className="mt-[12px] flex items-center gap-[8px]">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.5"
            value={rateText}
            onChange={(event) => setRateText(event.target.value)}
            aria-label="Charge percent"
            className="h-[40px] w-[90px] rounded-[10px] border border-line px-[10px] text-[14px] font-semibold text-ink outline-none focus:border-primary"
          />
          <span className="text-[14px] font-semibold text-ink">%</span>
          <button
            type="button"
            disabled={!isRateChanged || isSaving}
            onClick={() => onSave({ enabled: true, rate })}
            className="ml-auto h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
      {!isRateValid && <p className="mt-[6px] text-[12px] font-medium text-[#d64545]">০ থেকে ১০০-এর মধ্যে লিখুন।</p>}
      <p className="mt-[8px] text-[12px] font-medium leading-relaxed text-muted">
        প্রোভাইডার নিজে যে অর্ডার বানায় শুধু তাতে লাগে, সব প্রোভাইডারের জন্য একই নিয়ম। বদলালে নতুন অর্ডারে লাগবে, চলমান অর্ডারে না।
      </p>
    </div>
  );
}
