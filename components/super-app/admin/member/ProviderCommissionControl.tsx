'use client';

import { useState } from 'react';
import { useSetProviderCommission, useSetProviderOwnOrderCharge } from '@/hooks/useAdminMember';
import { Fact, Section } from './MemberParts';

const inputClass = 'h-[40px] w-full rounded-[8px] border border-line bg-white px-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary';
const saveButtonClass =
  'h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';

const isPercent = (text: string) => text.trim() !== '' && Number.isFinite(Number(text)) && Number(text) >= 0 && Number(text) <= 100;

interface ProviderCommissionControlProps {
  adminId: string;
  memberId: string;
  /** Orders from the platform (customers, dispatch): their own rate or the global one. */
  commissionRate: number;
  /** false = the global rate applies (no own rate set). */
  commissionIsCustom: boolean;
  globalCommissionRate: number;
  /** Orders this provider creates themselves; null = the global rule. */
  ownOrderChargeRate: number | null;
  /** The global rule for provider-created orders right now. */
  globalOwnOrderChargeRate: number;
  canChange: boolean;
}

/*
 * The platform's share of this provider's work, two kinds of order:
 * - orders from the platform: this provider's commission;
 * - orders they create themselves (Provider created): their own charge, or the global rule while none is set.
 * Every staff member who opens the panel sees both; only an admin changes them. New orders only: orders the
 * provider already has keep their percent.
 */
export function ProviderCommissionControl({ adminId, memberId, commissionRate, commissionIsCustom, globalCommissionRate, ownOrderChargeRate, globalOwnOrderChargeRate, canChange }: ProviderCommissionControlProps) {
  const saveCommission = useSetProviderCommission(adminId, memberId);
  const saveOwnCharge = useSetProviderOwnOrderCharge(adminId, memberId);
  // null = no edit yet, so the box shows the saved percent.
  const [commissionDraft, setCommissionDraft] = useState<string | null>(null);
  const [ownDraft, setOwnDraft] = useState<string | null>(null);
  // Empty box = the global rate; it shows the provider's own rate when they have one.
  const commissionText = commissionDraft ?? (commissionIsCustom ? String(commissionRate) : '');
  const ownText = ownDraft ?? (ownOrderChargeRate === null ? '' : String(ownOrderChargeRate));
  const usesGlobal = ownOrderChargeRate === null;
  const effectiveOwn = usesGlobal ? globalOwnOrderChargeRate : ownOrderChargeRate;

  return (
    <Section title="Commission">
      <Fact label="Platform orders">
        {commissionRate}% of each job {!commissionIsCustom && <span className="font-medium text-muted">(global)</span>}
      </Fact>
      <Fact label="Provider created orders">
        {effectiveOwn}% {usesGlobal && <span className="font-medium text-muted">(global)</span>}
      </Fact>

      {canChange && (
        <>
          {/* 1. Orders the platform sends this provider. */}
          <p className="mb-[6px] mt-[14px] text-[13px] font-semibold text-ink">প্ল্যাটফর্মের অর্ডারে কমিশন (%)</p>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.5}
            value={commissionText}
            placeholder={`খালি = গ্লোবাল হার (${globalCommissionRate}%)`}
            onChange={(event) => setCommissionDraft(event.target.value)}
            className={inputClass}
            aria-label="Commission on platform orders"
          />
          {commissionText.trim() !== '' && !isPercent(commissionText) && <p className="mt-[6px] text-[13px] font-medium text-[#d64545]">০ থেকে ১০০-এর মধ্যে লিখুন, অথবা খালি রাখুন।</p>}
          <p className="mt-[6px] text-[12px] font-medium text-muted">কাস্টমার বা প্ল্যাটফর্ম থেকে যে অর্ডার এই প্রোভাইডার পায়। খালি রাখলে গ্লোবাল হার চলবে (এখন {globalCommissionRate}%)।</p>
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            <button
              type="button"
              disabled={
                saveCommission.isPending ||
                (commissionText.trim() === '' ? !commissionIsCustom : !isPercent(commissionText) || (commissionIsCustom && Number(commissionText) === commissionRate))
              }
              onClick={() => saveCommission.mutate(commissionText.trim() === '' ? null : Number(commissionText), { onSuccess: () => setCommissionDraft(null) })}
              className={saveButtonClass}
            >
              {saveCommission.isPending ? 'Saving...' : 'Save'}
            </button>
            {commissionIsCustom && (
              <button
                type="button"
                disabled={saveCommission.isPending}
                onClick={() => saveCommission.mutate(null, { onSuccess: () => setCommissionDraft(null) })}
                className="h-[40px] cursor-pointer rounded-[10px] border border-chip bg-white px-[16px] text-[14px] font-semibold text-ink hover:bg-surface disabled:opacity-50"
              >
                গ্লোবাল হারে ফেরান
              </button>
            )}
          </div>

          {/* 2. Orders the provider brings in themselves. Empty = the global rule. */}
          <div className="mt-[18px] border-t border-line pt-[14px]">
            <p className="mb-[6px] text-[13px] font-semibold text-ink">নিজের আনা অর্ডারে চার্জ (%) · Provider created</p>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.5}
              value={ownText}
              placeholder={`খালি = গ্লোবাল নিয়ম (${globalOwnOrderChargeRate}%)`}
              onChange={(event) => setOwnDraft(event.target.value)}
              className={inputClass}
              aria-label="Charge on provider-created orders"
            />
            {ownText.trim() !== '' && !isPercent(ownText) && <p className="mt-[6px] text-[13px] font-medium text-[#d64545]">০ থেকে ১০০-এর মধ্যে লিখুন, অথবা খালি রাখুন।</p>}
            <p className="mt-[6px] text-[12px] font-medium text-muted">
              প্রোভাইডার নিজে যে অর্ডার বানায় শুধু তাতে লাগে। খালি রাখলে সবার জন্য একই গ্লোবাল নিয়ম চলবে (এখন {globalOwnOrderChargeRate}%)।
            </p>
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              <button
                type="button"
                disabled={
                  saveOwnCharge.isPending ||
                  (ownText.trim() === '' ? usesGlobal : !isPercent(ownText) || Number(ownText) === ownOrderChargeRate)
                }
                onClick={() => saveOwnCharge.mutate(ownText.trim() === '' ? null : Number(ownText), { onSuccess: () => setOwnDraft(null) })}
                className={saveButtonClass}
              >
                {saveOwnCharge.isPending ? 'Saving...' : 'Save'}
              </button>
              {!usesGlobal && (
                <button
                  type="button"
                  disabled={saveOwnCharge.isPending}
                  onClick={() => saveOwnCharge.mutate(null, { onSuccess: () => setOwnDraft(null) })}
                  className="h-[40px] cursor-pointer rounded-[10px] border border-chip bg-white px-[16px] text-[14px] font-semibold text-ink hover:bg-surface disabled:opacity-50"
                >
                  গ্লোবাল নিয়মে ফেরান
                </button>
              )}
            </div>
          </div>

          <p className="mt-[12px] text-[12px] font-medium text-muted">শুধু নতুন অর্ডারে লাগবে; এই প্রোভাইডারের চলমান অর্ডার আগের হারেই থাকবে।</p>
        </>
      )}
    </Section>
  );
}
