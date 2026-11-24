'use client';

import { ReactNode } from 'react';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useProviderEarnings } from '@/hooks/useProviderEarnings';
import { bnDate, bnMonth, bnNumber } from './earnings-format';

const sectionTitleClass = 'mb-[8px] mt-[22px] text-[13px] font-semibold uppercase tracking-[0.4px] text-muted';

function Tile({ label, value, hint, tone = 'normal' }: { label: string; value: string; hint?: string; tone?: 'normal' | 'danger' }) {
  return (
    <div className="flex flex-col gap-[2px] rounded-[12px] border border-line bg-white p-[12px]">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <span className={`text-[17px] font-semibold tracking-[-0.3px] ${tone === 'danger' ? 'text-[#d64545]' : 'text-ink'}`}>{value}</span>
      {hint && <span className="text-[11px] font-medium text-muted">{hint}</span>}
    </div>
  );
}

function Message({ children, isError = false }: { children: ReactNode; isError?: boolean }) {
  return <p className={`text-[14px] font-medium ${isError ? 'text-[#d64545]' : 'text-muted'}`}>{children}</p>;
}

/*
 * "আয়": what the provider has earned. A job's income is its bill minus the platform's commission, plus the tip.
 * Totals at the top, then the last six months, then each recent job.
 */
export function EarningsTab({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useProviderEarnings(userId, true);
  if (isLoading) return <Message>আয়ের হিসাব লোড হচ্ছে...</Message>;
  if (isError || !data) return <Message isError>আয়ের হিসাব লোড করা যায়নি।</Message>;

  const { summary, monthly, transactions } = data;
  const change = summary.thisMonth - summary.lastMonth;

  return (
    <div className="pb-[24px]">
      <div className="rounded-[14px] bg-secondary p-[16px]">
        <p className="text-[13px] font-semibold text-ink">মোট নেট আয়</p>
        <p className="mt-[2px] text-[28px] font-semibold tracking-[-0.6px] text-ink">{formatTaka(summary.netIncome)}</p>
        <p className="mt-[4px] text-[12px] font-medium text-ink">
          {bnNumber(summary.completedOrders)}টি সম্পন্ন কাজ থেকে, কমিশন বাদে ও টিপসসহ
        </p>
      </div>

      <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
        <Tile
          label="এই মাসে"
          value={formatTaka(summary.thisMonth)}
          hint={summary.lastMonth > 0 || summary.thisMonth > 0 ? `গত মাসের চেয়ে ${change >= 0 ? '+' : ''}${formatTaka(change)}` : undefined}
        />
        <Tile label="আসন্ন আয়" value={formatTaka(summary.expectedEarnings)} hint={`${bnNumber(summary.activeOrders)}টি চলমান কাজ`} />
        <Tile label="গড় অর্ডার মূল্য" value={formatTaka(summary.averageOrderValue)} />
        <Tile label="টিপস" value={formatTaka(summary.tips)} />
        <Tile label="ক্যাশে পাওয়া আয়" value={formatTaka(summary.cashIncome)} hint="গ্রাহক সাইটে দিয়েছেন" />
        <Tile label="অনলাইনে পাওয়া আয়" value={formatTaka(summary.onlineIncome)} hint="প্ল্যাটফর্মে জমা হয়েছে" />
        <Tile label="প্ল্যাটফর্ম কমিশন" value={formatTaka(summary.commissionPaid)} />
        <Tile
          label="বকেয়া (Due)"
          value={summary.dueAmount > 0 ? formatTaka(summary.dueAmount) : 'নেই'}
          hint={summary.dueAmount > 0 ? 'ক্যাশ কাজের কমিশন' : undefined}
          tone={summary.dueAmount > 0 ? 'danger' : 'normal'}
        />
      </div>

      <p className={sectionTitleClass}>মাসিক হিসাব</p>
      <ul className="divide-y divide-line rounded-[12px] border border-line bg-white">
        {[...monthly].reverse().map((row) => (
          <li key={row.month} className="flex items-center justify-between gap-[12px] px-[12px] py-[10px]">
            <span className="flex flex-col">
              <span className="text-[14px] font-semibold text-ink">{bnMonth(row.month)}</span>
              <span className="text-[12px] font-medium text-muted">
                {bnNumber(row.orders)}টি কাজ · কমিশন {formatTaka(row.commission)}
              </span>
            </span>
            <span className={`text-[15px] font-semibold ${row.net > 0 ? 'text-primary' : 'text-muted'}`}>{formatTaka(row.net)}</span>
          </li>
        ))}
      </ul>

      <p className={sectionTitleClass}>সাম্প্রতিক লেনদেন</p>
      {transactions.length === 0 ? (
        <p className="rounded-[12px] bg-surface p-[14px] text-[13px] font-medium text-muted">এখনো কোনো কাজ সম্পন্ন হয়নি। প্রথম কাজ শেষ হলে এখানে দেখাবে।</p>
      ) : (
        <ul className="flex flex-col gap-[8px]">
          {transactions.map((row) => (
            <li key={row.orderId} className="rounded-[12px] border border-line bg-white p-[12px]">
              <div className="flex items-start justify-between gap-[12px]">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] font-semibold text-ink">{row.serviceName}</span>
                  <span className="text-[12px] font-medium text-muted">
                    #{row.referenceCode} · {bnDate(row.completedAt)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-[4px]">
                  <span className="text-[15px] font-semibold text-primary">{formatTaka(row.net)}</span>
                  <span className="rounded-full bg-surface px-[8px] py-[1px] text-[11px] font-semibold text-ink">{row.paymentMode === 'CASH' ? 'ক্যাশ' : 'অনলাইন'}</span>
                </span>
              </div>
              <p className="mt-[6px] text-[12px] font-medium text-muted">
                বিল {formatTaka(row.billed)} − কমিশন {formatTaka(row.commission)} ({bnNumber(row.commissionRate, 2)}%)
                {row.tip > 0 && <> + টিপ {formatTaka(row.tip)}</>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
