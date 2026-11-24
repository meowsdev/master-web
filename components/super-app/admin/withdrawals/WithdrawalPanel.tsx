'use client';

import { useState } from 'react';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useAdminWithdrawals } from '@/hooks/useWithdrawals';
import { Fact, Section, formatDate } from '../member/MemberParts';
import { PAYOUT_METHOD_LABEL, WITHDRAWAL_STATUS_CLASS, WITHDRAWAL_STATUS_LABEL } from '../../provider/earnings/withdrawal-labels';
import { providerDisplayName } from './WithdrawalsSidebar';

const inputClass = 'h-[40px] w-full rounded-[8px] border border-line bg-white px-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary';
const primaryButton = 'h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';
const dangerButton = 'h-[40px] cursor-pointer rounded-[10px] border border-[#d64545] px-[16px] text-[14px] font-semibold text-[#d64545] hover:bg-[#fdecec] disabled:cursor-not-allowed disabled:opacity-60';

/*
 * One withdrawal request. The admin sends the money by bKash / Nagad / bank outside the app, then marks it paid
 * with that transaction id; or rejects it with a reason, and the amount goes back to the provider's balance.
 */
export function WithdrawalPanel({ adminId, withdrawalId, onClose }: { adminId: string; withdrawalId: string; onClose: () => void }) {
  const { list, markPaid, reject } = useAdminWithdrawals(adminId);
  const [mode, setMode] = useState<'idle' | 'pay' | 'reject'>('idle');
  const [transactionRef, setTransactionRef] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const item = list.data?.find((row) => row.id === withdrawalId);

  if (!item) {
    return (
      <SidePanelShell title="উইথড্র রিকোয়েস্ট" onClose={onClose}>
        <p className="text-[14px] font-medium text-muted">{list.isLoading ? 'লোড হচ্ছে...' : 'রিকোয়েস্টটি পাওয়া যায়নি।'}</p>
      </SidePanelShell>
    );
  }

  const isPending = item.status === 'PENDING';
  const isBusy = markPaid.isPending || reject.isPending;

  return (
    <SidePanelShell title="উইথড্র রিকোয়েস্ট" onClose={onClose}>
      <div className="mb-[16px] flex items-center justify-between gap-[12px] rounded-[14px] bg-secondary p-[16px]">
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold text-ink">{providerDisplayName(item.provider)}</span>
          <span className="text-[26px] font-semibold tracking-[-0.5px] text-ink">{formatTaka(item.amount)}</span>
        </span>
        <span className={`rounded-full px-[10px] py-[2px] text-[12px] font-semibold ${WITHDRAWAL_STATUS_CLASS[item.status]}`}>{WITHDRAWAL_STATUS_LABEL[item.status]}</span>
      </div>

      <Section title="কোথায় পাঠাবেন">
        <Fact label="মাধ্যম">{PAYOUT_METHOD_LABEL[item.method]}</Fact>
        {item.bankName && <Fact label="ব্যাংক">{item.bankName}</Fact>}
        {item.branchName && <Fact label="ব্রাঞ্চ">{item.branchName}</Fact>}
        <Fact label={item.method === 'BANK' ? 'অ্যাকাউন্ট নম্বর' : 'নম্বর'}>
          <span className="select-all font-semibold">{item.accountNumber}</span>
        </Fact>
        <Fact label="অ্যাকাউন্টের নাম">{item.accountName}</Fact>
      </Section>

      <Section title="পার্টনার">
        {item.provider && <Fact label="ফোন">{item.provider.user.mobileNumber}</Fact>}
        {item.provider && <Fact label="বর্তমান ব্যালেন্স">{formatTaka(item.provider.walletBalance)}</Fact>}
        <Fact label="রিকোয়েস্টের সময়">{formatDate(item.createdAt)}</Fact>
        {item.reviewedAt && <Fact label="উত্তরের সময়">{formatDate(item.reviewedAt)}</Fact>}
        {item.transactionRef && <Fact label="ট্রানজেকশন আইডি">{item.transactionRef}</Fact>}
        {item.reviewNote && <Fact label={item.status === 'REJECTED' ? 'রিজেক্টের কারণ' : 'নোট'}>{item.reviewNote}</Fact>}
      </Section>

      {isPending && mode === 'idle' && (
        <div className="mt-[16px] flex gap-[8px]">
          <button type="button" onClick={() => setMode('pay')} className={primaryButton}>
            পাঠিয়েছি, Paid করুন
          </button>
          <button type="button" onClick={() => setMode('reject')} className={dangerButton}>
            রিজেক্ট
          </button>
        </div>
      )}

      {isPending && mode === 'pay' && (
        <div className="mt-[16px]">
          <p className="mb-[8px] text-[13px] font-medium text-muted">
            আগে {PAYOUT_METHOD_LABEL[item.method]}-এ {formatTaka(item.amount)} পাঠান, তারপর সেই ট্রানজেকশন আইডি লিখুন। পার্টনার এটা দেখতে পাবেন।
          </p>
          <input value={transactionRef} onChange={(event) => setTransactionRef(event.target.value)} maxLength={100} placeholder="ট্রানজেকশন আইডি" className={inputClass} aria-label="Transaction id" />
          <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="নোট (ঐচ্ছিক)" className={`${inputClass} mt-[8px]`} aria-label="Note" />
          <div className="mt-[10px] flex gap-[8px]">
            <button
              type="button"
              disabled={!transactionRef.trim() || isBusy}
              onClick={() => markPaid.mutate({ id: item.id, transactionRef: transactionRef.trim(), note }, { onSuccess: () => setMode('idle') })}
              className={primaryButton}
            >
              {markPaid.isPending ? 'সেভ হচ্ছে...' : 'Paid হিসেবে সেভ করুন'}
            </button>
            <button type="button" onClick={() => setMode('idle')} className="h-[40px] cursor-pointer rounded-[10px] border border-line px-[16px] text-[14px] font-semibold text-ink hover:bg-surface">
              বাদ দিন
            </button>
          </div>
        </div>
      )}

      {isPending && mode === 'reject' && (
        <div className="mt-[16px]">
          <p className="mb-[8px] text-[13px] font-medium text-muted">টাকা পার্টনারের ব্যালেন্সে ফিরে যাবে। কারণটা পার্টনার দেখতে পাবেন।</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="কারণ, যেমন: নম্বরটা ভুল"
            className="w-full rounded-[8px] border border-line bg-white p-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary"
            aria-label="Reason"
          />
          <div className="mt-[10px] flex gap-[8px]">
            <button
              type="button"
              disabled={!reason.trim() || isBusy}
              onClick={() => reject.mutate({ id: item.id, reason: reason.trim() }, { onSuccess: () => setMode('idle') })}
              className={dangerButton}
            >
              {reject.isPending ? 'রিজেক্ট হচ্ছে...' : 'রিজেক্ট করুন'}
            </button>
            <button type="button" onClick={() => setMode('idle')} className="h-[40px] cursor-pointer rounded-[10px] border border-line px-[16px] text-[14px] font-semibold text-ink hover:bg-surface">
              বাদ দিন
            </button>
          </div>
        </div>
      )}
    </SidePanelShell>
  );
}
