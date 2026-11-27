'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { platformSettingsService } from '@/services/platform-settings.service';

const QUERY_KEY = ['admin-platform-order-commission'];

/*
 * Admin only: the global commission on orders from the platform (the platform's share). Every provider without
 * their own rate gets it, which is every provider added from now on; a provider's own rate (set on their details)
 * wins over it. New orders only: running orders keep their percent.
 */
export function PlatformCommissionCard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: QUERY_KEY, queryFn: platformSettingsService.getPlatformOrderCommission });
  const save = useMutation({
    mutationFn: platformSettingsService.setPlatformOrderCommission,
    onSuccess: (saved) => {
      queryClient.setQueryData(QUERY_KEY, saved);
      toast.success(`প্ল্যাটফর্মের অর্ডারে গ্লোবাল কমিশন এখন ${saved.rate}%`);
    },
    onError: () => toast.error('সেভ করা যায়নি, আবার চেষ্টা করুন।'),
  });

  if (isLoading) return null;
  if (isError || !data) return <p className="mt-[8px] text-[12px] font-medium text-[#d64545]">গ্লোবাল কমিশন লোড করা যায়নি।</p>;
  return <RateForm key={data.rate} saved={data.rate} isSaving={save.isPending} onSave={(rate) => save.mutate(rate)} />;
}

function RateForm({ saved, isSaving, onSave }: { saved: number; isSaving: boolean; onSave: (rate: number) => void }) {
  const [text, setText] = useState(String(saved));
  const rate = Number(text);
  const isValid = text.trim() !== '' && Number.isFinite(rate) && rate >= 0 && rate <= 100;

  return (
    <div className="rounded-[12px] border border-line bg-white p-[14px]">
      <span className="flex flex-col">
        <span className="text-[14px] font-semibold text-ink">প্ল্যাটফর্মের অর্ডারে কমিশন</span>
        <span className="text-[12px] font-medium text-muted">এখন {saved}% · প্ল্যাটফর্ম থেকে পাওয়া প্রতিটি অর্ডারে প্ল্যাটফর্মের ভাগ</span>
      </span>
      <div className="mt-[12px] flex items-center gap-[8px]">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step="0.5"
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Global commission on platform orders"
          className="h-[40px] w-[90px] rounded-[10px] border border-line px-[10px] text-[14px] font-semibold text-ink outline-none focus:border-primary"
        />
        <span className="text-[14px] font-semibold text-ink">%</span>
        <button
          type="button"
          disabled={!isValid || rate === saved || isSaving}
          onClick={() => onSave(rate)}
          className="ml-auto h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {!isValid && <p className="mt-[6px] text-[12px] font-medium text-[#d64545]">০ থেকে ১০০-এর মধ্যে লিখুন।</p>}
      <p className="mt-[8px] text-[12px] font-medium leading-relaxed text-muted">
        যে প্রোভাইডারের নিজের আলাদা হার নেই (নতুন সব প্রোভাইডার) সে এটা পাবে। কারো জন্য আলাদা হার দিতে তার প্রোফাইলের Commission অংশে যান। বদলালে নতুন অর্ডারে লাগবে, চলমান অর্ডারে না।
      </p>
    </div>
  );
}
