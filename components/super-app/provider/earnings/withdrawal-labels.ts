import { PayoutMethod, WithdrawalStatus } from '@/types/provider-earnings.types';

export const PAYOUT_METHOD_LABEL: Record<PayoutMethod, string> = { BKASH: 'বিকাশ', NAGAD: 'নগদ', BANK: 'ব্যাংক' };

export const WITHDRAWAL_STATUS_LABEL: Record<WithdrawalStatus, string> = {
  PENDING: 'অপেক্ষমাণ',
  PAID: 'পেইড',
  REJECTED: 'রিজেক্টেড',
  CANCELLED: 'বাতিল',
};

/** Waiting = warning amber, paid = primary, rejected = danger, cancelled = muted (palette exceptions in CLAUDE.md). */
export const WITHDRAWAL_STATUS_CLASS: Record<WithdrawalStatus, string> = {
  PENDING: 'bg-[#fff4e5] text-[#b7791f]',
  PAID: 'bg-secondary text-ink',
  REJECTED: 'bg-[#fdecec] text-[#d64545]',
  CANCELLED: 'bg-surface text-muted',
};

/** "বিকাশ · 01712345678" or "ব্যাংক · City Bank · 1234567890". */
export const payoutDestination = (request: { method: PayoutMethod; accountNumber: string; bankName: string | null }) =>
  [PAYOUT_METHOD_LABEL[request.method], request.bankName, request.accountNumber].filter(Boolean).join(' · ');
