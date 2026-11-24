'use client';

import { useState } from 'react';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useMyWithdrawals } from '@/hooks/useWithdrawals';
import { PayoutMethod, ProviderWalletCard } from '@/types/provider-earnings.types';
import { ChipRow } from '../../ChipRow';
import { bnDate, bnNumber } from './earnings-format';
import { PAYOUT_METHOD_LABEL, WITHDRAWAL_STATUS_CLASS, WITHDRAWAL_STATUS_LABEL, payoutDestination } from './withdrawal-labels';

const inputClass = 'h-[40px] w-full rounded-[8px] border border-line bg-white px-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary';
const labelClass = 'mb-[4px] mt-[10px] block text-[13px] font-semibold text-ink';
const primaryButton = 'h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';
const METHOD_CHIPS = (['BKASH', 'NAGAD', 'BANK'] as const).map((id) => ({ id, label: PAYOUT_METHOD_LABEL[id] }));

/*
 * The provider's balance and "উইথড্র করুন". Online jobs' share comes into the balance and can be withdrawn once
 * its clearance period is over. Asking holds the amount at once; an admin sends it and marks it paid.
 */
export function WithdrawCard({ userId, wallet }: { userId: string; wallet: ProviderWalletCard }) {
  const { list, request, cancel } = useMyWithdrawals(userId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const withdrawals = list.data ?? [];
  const hasPending = withdrawals.some((item) => item.status === 'PENDING');
  const canWithdraw = !hasPending && wallet.availableForWithdrawal >= wallet.minWithdrawal;

  return (
    <div className="mb-[12px] rounded-[14px] border border-line bg-white p-[16px]">
      <div className="flex items-start justify-between gap-[12px]">
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold text-muted">উইথড্র করা যাবে</span>
          <span className="text-[26px] font-semibold tracking-[-0.5px] text-primary">{formatTaka(wallet.availableForWithdrawal)}</span>
        </span>
        {!isFormOpen && (
          <button type="button" disabled={!canWithdraw} onClick={() => setIsFormOpen(true)} className={primaryButton}>
            উইথড্র করুন
          </button>
        )}
      </div>

      <dl className="mt-[10px] grid grid-cols-3 gap-[8px] text-[12px] font-medium">
        <div>
          <dt className="text-muted">ক্লিয়ার হচ্ছে</dt>
          <dd className="text-[14px] font-semibold text-ink">{formatTaka(wallet.pendingClearance)}</dd>
        </div>
        <div>
          <dt className="text-muted">রিকোয়েস্টে আছে</dt>
          <dd className="text-[14px] font-semibold text-ink">{formatTaka(wallet.pendingWithdrawal)}</dd>
        </div>
        <div>
          <dt className="text-muted">মোট তোলা হয়েছে</dt>
          <dd className="text-[14px] font-semibold text-ink">{formatTaka(wallet.withdrawn)}</dd>
        </div>
      </dl>

      {!isFormOpen && (
        <p className="mt-[10px] text-[12px] font-medium leading-relaxed text-muted">
          {hasPending
            ? 'একটা রিকোয়েস্ট অপেক্ষায় আছে। সেটা শেষ হলে আবার উইথড্র করতে পারবেন।'
            : `অনলাইন পেমেন্টের টাকা কাজ শেষ হওয়ার ${bnNumber(wallet.clearanceDays)} দিন পর উইথড্র করা যায়। সর্বনিম্ন উইথড্র ${formatTaka(wallet.minWithdrawal)}।`}
        </p>
      )}

      {isFormOpen && (
        <WithdrawForm
          available={wallet.availableForWithdrawal}
          minimum={wallet.minWithdrawal}
          isSending={request.isPending}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={(input) => request.mutate(input, { onSuccess: () => setIsFormOpen(false) })}
        />
      )}

      {withdrawals.length > 0 && (
        <>
          <p className="mb-[8px] mt-[18px] text-[13px] font-semibold uppercase tracking-[0.4px] text-muted">উইথড্র হিস্ট্রি</p>
          <ul className="flex flex-col gap-[8px]">
            {withdrawals.slice(0, 10).map((item) => (
              <li key={item.id} className="rounded-[12px] border border-line p-[10px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <span className="text-[15px] font-semibold text-ink">{formatTaka(item.amount)}</span>
                  <span className={`rounded-full px-[8px] py-[1px] text-[11px] font-semibold ${WITHDRAWAL_STATUS_CLASS[item.status]}`}>{WITHDRAWAL_STATUS_LABEL[item.status]}</span>
                </div>
                <p className="mt-[2px] text-[12px] font-medium text-muted">
                  {payoutDestination(item)} · {bnDate(item.createdAt)}
                </p>
                {item.transactionRef && <p className="text-[12px] font-medium text-ink">ট্রানজেকশন আইডি: {item.transactionRef}</p>}
                {item.status === 'REJECTED' && item.reviewNote && <p className="text-[12px] font-medium text-[#d64545]">কারণ: {item.reviewNote}</p>}
                {item.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate(item.id)}
                    className="mt-[6px] cursor-pointer text-[13px] font-semibold text-[#d64545] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    রিকোয়েস্ট বাতিল করুন
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function WithdrawForm({ available, minimum, isSending, onCancel, onSubmit }: {
  available: number;
  minimum: number;
  isSending: boolean;
  onCancel: () => void;
  onSubmit: (input: { amount: number; method: PayoutMethod; accountNumber: string; accountName: string; bankName?: string; branchName?: string }) => void;
}) {
  const [amount, setAmount] = useState(String(Math.floor(available)));
  const [method, setMethod] = useState<PayoutMethod>('BKASH');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');

  const value = Number(amount);
  const isBank = method === 'BANK';
  const amountError =
    !Number.isInteger(value) || value <= 0 ? 'পুরো টাকায় লিখুন' : value < minimum ? `সর্বনিম্ন ${formatTaka(minimum)}` : value > available ? `সর্বোচ্চ ${formatTaka(available)}` : null;
  const numberError = !isBank && accountNumber !== '' && !/^01[3-9]\d{8}$/.test(accountNumber.trim()) ? '১১ ডিজিটের নম্বর লিখুন, যেমন 01712345678' : null;
  const isReady =
    !amountError && !numberError && accountNumber.trim() !== '' && accountName.trim() !== '' && (!isBank || bankName.trim() !== '') && !isSending;

  return (
    <div className="mt-[14px] border-t border-line pt-[12px]">
      <label className={labelClass} htmlFor="withdraw-amount">পরিমাণ (৳)</label>
      <input id="withdraw-amount" type="number" inputMode="numeric" min={minimum} max={available} step={1} value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} />
      {amountError && <p className="mt-[4px] text-[12px] font-medium text-[#d64545]">{amountError}</p>}

      <p className={labelClass}>কোথায় নেবেন</p>
      <ChipRow chips={METHOD_CHIPS} activeId={method} onSelect={setMethod} label="Payout method" rowClassName="pb-[4px]" />

      <label className={labelClass} htmlFor="withdraw-number">{isBank ? 'অ্যাকাউন্ট নম্বর' : `${PAYOUT_METHOD_LABEL[method]} নম্বর`}</label>
      <input
        id="withdraw-number"
        inputMode={isBank ? 'text' : 'tel'}
        maxLength={isBank ? 40 : 11}
        value={accountNumber}
        onChange={(event) => setAccountNumber(event.target.value)}
        placeholder={isBank ? '' : '01XXXXXXXXX'}
        className={inputClass}
      />
      {numberError && <p className="mt-[4px] text-[12px] font-medium text-[#d64545]">{numberError}</p>}

      <label className={labelClass} htmlFor="withdraw-name">অ্যাকাউন্টের নাম</label>
      <input id="withdraw-name" maxLength={100} value={accountName} onChange={(event) => setAccountName(event.target.value)} className={inputClass} />

      {isBank && (
        <>
          <label className={labelClass} htmlFor="withdraw-bank">ব্যাংকের নাম</label>
          <input id="withdraw-bank" maxLength={100} value={bankName} onChange={(event) => setBankName(event.target.value)} className={inputClass} />
          <label className={labelClass} htmlFor="withdraw-branch">ব্রাঞ্চ (ঐচ্ছিক)</label>
          <input id="withdraw-branch" maxLength={100} value={branchName} onChange={(event) => setBranchName(event.target.value)} className={inputClass} />
        </>
      )}

      <p className="mt-[10px] text-[12px] font-medium text-muted">রিকোয়েস্ট পাঠালে টাকা ব্যালেন্স থেকে আলাদা হয়ে যায়। অ্যাডমিন পাঠিয়ে দিলে ট্রানজেকশন আইডি এখানে দেখাবে।</p>

      <div className="mt-[12px] flex gap-[8px]">
        <button
          type="button"
          disabled={!isReady}
          onClick={() =>
            onSubmit({
              amount: value,
              method,
              accountNumber: accountNumber.trim(),
              accountName: accountName.trim(),
              ...(isBank ? { bankName: bankName.trim(), ...(branchName.trim() ? { branchName: branchName.trim() } : {}) } : {}),
            })
          }
          className={primaryButton}
        >
          {isSending ? 'পাঠানো হচ্ছে...' : 'রিকোয়েস্ট পাঠান'}
        </button>
        <button type="button" onClick={onCancel} className="h-[40px] cursor-pointer rounded-[10px] border border-line px-[16px] text-[14px] font-semibold text-ink hover:bg-surface">
          বাদ দিন
        </button>
      </div>
    </div>
  );
}
