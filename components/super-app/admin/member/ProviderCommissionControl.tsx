'use client';

import { useState } from 'react';
import { useSetProviderCommission } from '@/hooks/useAdminMember';
import { Fact, Section } from './MemberParts';

const inputClass = 'h-[40px] w-full rounded-[8px] border border-line bg-white px-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary';

/*
 * The platform's share of this provider's jobs. Every staff member who opens the panel sees it; only an admin
 * changes it. New orders use the new percent; orders the provider already has keep theirs.
 */
export function ProviderCommissionControl({ adminId, memberId, commissionRate, canChange }: { adminId: string; memberId: string; commissionRate: number; canChange: boolean }) {
  const save = useSetProviderCommission(adminId, memberId);
  // null = no edit yet, so the box shows the saved percent.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? String(commissionRate);
  const value = Number(text);
  const isValid = text.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= 100;

  return (
    <Section title="Commission">
      <Fact label="Platform share">{commissionRate}% of each job</Fact>

      {canChange && (
        <>
          <p className="mb-[6px] mt-[14px] text-[13px] font-semibold text-ink">Change commission (%)</p>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.5}
            value={text}
            onChange={(event) => setDraft(event.target.value)}
            className={inputClass}
            aria-label="Commission percent"
          />
          {!isValid && <p className="mt-[6px] text-[13px] font-medium text-[#d64545]">Enter a percent from 0 to 100.</p>}
          <p className="mt-[6px] text-[13px] font-medium text-muted">Applies to new orders. Orders this provider already has keep their percent.</p>
          <button
            type="button"
            disabled={!isValid || value === commissionRate || save.isPending}
            onClick={() => save.mutate(value, { onSuccess: () => setDraft(null) })}
            className="mt-[10px] h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {save.isPending ? 'Saving...' : 'Save commission'}
          </button>
        </>
      )}
    </Section>
  );
}
