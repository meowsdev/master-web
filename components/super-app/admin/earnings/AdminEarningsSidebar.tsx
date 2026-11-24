'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { adminEarningsService } from '@/services/provider-wallet.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User } from '@/types/auth.types';
import { AdminEarningsReport } from '@/types/provider-earnings.types';
import { ChipRow } from '../../ChipRow';
import { SupportAvatar } from '../../support/SupportAvatar';
import { StaffSidebarHeader } from '../AdminProfileHeader';
import { StatTile } from '../../provider/earnings/StatTile';
import { bnMonth, bnNumber } from '../../provider/earnings/earnings-format';

type Tab = 'SUMMARY' | 'MONTHLY' | 'PARTNERS';
const TABS = [
  { id: 'SUMMARY', label: 'সারাংশ' },
  { id: 'MONTHLY', label: 'মাসিক' },
  { id: 'PARTNERS', label: 'পার্টনার অনুযায়ী' },
] as const;

const sectionTitleClass = 'mb-[8px] mt-[20px] text-[13px] font-semibold uppercase tracking-[0.4px] text-muted';
const percent = (value: number) => `${bnNumber(value, 2)}%`;

/*
 * Admin's Earnings tab: the platform's commission income (after approved parts / costs), the last six months,
 * each partner's share, and the money between the platform and partners (dues owed to us, balances we owe).
 * A partner row opens their details, where the commission percent is set.
 */
export function AdminEarningsSidebar({ user, onPartnerOpened }: { user: User; onPartnerOpened: () => void }) {
  const [tab, setTab] = useState<Tab>('SUMMARY');
  const { data, isLoading, isError } = useQuery({ queryKey: ['admin-earnings', user.id], queryFn: adminEarningsService.report, refetchInterval: 60000 });

  return (
    <>
      <div className="shrink-0 px-[16px] pt-[16px]">
        <StaffSidebarHeader user={user} />
        <h2 className="mt-[14px] text-[18px] font-semibold tracking-[-0.36px] text-ink">আয়ের হিসাব</h2>
      </div>
      <ChipRow chips={TABS} activeId={tab} onSelect={setTab} label="Earnings" />

      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[24px]">
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
        {isError && <p className="p-[16px] text-center text-[14px] font-medium text-[#d64545]">আয়ের হিসাব লোড করা যায়নি।</p>}
        {data && tab === 'SUMMARY' && <Summary report={data} />}
        {data && tab === 'MONTHLY' && <Monthly report={data} />}
        {data && tab === 'PARTNERS' && <Partners report={data} onPartnerOpened={onPartnerOpened} />}
      </div>
    </>
  );
}

function Summary({ report }: { report: AdminEarningsReport }) {
  const { summary, wallets } = report;
  const change = summary.thisMonth - summary.lastMonth;

  return (
    <>
      <div className="rounded-[14px] bg-secondary p-[16px]">
        <p className="text-[13px] font-semibold text-ink">মোট কমিশন আয়</p>
        <p className="mt-[2px] text-[28px] font-semibold tracking-[-0.6px] text-ink">{formatTaka(summary.commissionTotal)}</p>
        <p className="mt-[4px] text-[12px] font-medium text-ink">
          {bnNumber(summary.completedOrders)}টি সম্পন্ন অর্ডার থেকে · মোট বিলের গড় {percent(summary.averageCommissionPercent)}
        </p>
      </div>

      <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
        <StatTile label="এই মাসে" value={formatTaka(summary.thisMonth)} hint={`গত মাসের চেয়ে ${change >= 0 ? '+' : ''}${formatTaka(change)}`} />
        <StatTile label="আসন্ন কমিশন" value={formatTaka(summary.expectedCommission)} hint={`${bnNumber(summary.activeOrders)}টি চলমান অর্ডার`} />
        <StatTile label="মোট বিল (GMV)" value={formatTaka(summary.billedTotal)} />
        <StatTile label="পার্টনারদের টিপস" value={formatTaka(summary.partnerTips)} hint="পুরোটা পার্টনার পায়" />
        <StatTile label="ক্যাশ কাজের কমিশন" value={formatTaka(summary.cashCommission)} hint="পার্টনার Due দিলে আসে" />
        <StatTile label="অনলাইন কাজের কমিশন" value={formatTaka(summary.onlineCommission)} hint="পেমেন্ট থেকেই রাখা" />
        <StatTile label="অনুমোদিত পার্টস / খরচ" value={formatTaka(summary.approvedCosts)} />
        <StatTile label="খরচের জন্য কমিশন কমেছে" value={formatTaka(summary.commissionReducedByCosts)} />
      </div>

      <p className={sectionTitleClass}>পার্টনারদের সাথে লেনদেন</p>
      <div className="grid grid-cols-2 gap-[8px]">
        <StatTile label="পাওনা (Due)" value={formatTaka(wallets.duesReceivable)} hint={`${bnNumber(wallets.partnersWithDue)} জন পার্টনারের কাছে`} tone={wallets.duesReceivable > 0 ? 'danger' : 'normal'} />
        <StatTile label="পার্টনারদের ব্যালেন্স" value={formatTaka(wallets.partnerBalances)} hint={`${bnNumber(wallets.partnersWithBalance)} জনকে দিতে হবে`} />
        <StatTile label="অপেক্ষমাণ উইথড্র" value={formatTaka(wallets.pendingWithdrawals)} hint={`${bnNumber(wallets.pendingWithdrawalCount)}টি রিকোয়েস্ট`} />
        <StatTile label="মোট পেআউট" value={formatTaka(wallets.paidOut)} />
      </div>
      <p className="mt-[10px] text-[12px] font-medium leading-relaxed text-muted">
        কমিশন ধরা হয় সম্পন্ন অর্ডার থেকে, অনুমোদিত পার্টস / খরচ বাদ দিয়ে, প্রতিটা অর্ডারের পার্টনার রেটে। রিভিশনের বাড়তি বিলের কমিশনও এতে আছে।
      </p>
    </>
  );
}

function Monthly({ report }: { report: AdminEarningsReport }) {
  return (
    <ul className="mt-[4px] divide-y divide-line rounded-[12px] border border-line bg-white">
      {[...report.monthly].reverse().map((row) => (
        <li key={row.month} className="flex items-center justify-between gap-[12px] px-[12px] py-[10px]">
          <span className="flex flex-col">
            <span className="text-[14px] font-semibold text-ink">{bnMonth(row.month)}</span>
            <span className="text-[12px] font-medium text-muted">
              {bnNumber(row.orders)}টি অর্ডার · বিল {formatTaka(row.billed)}
            </span>
          </span>
          <span className={`text-[15px] font-semibold ${row.commission > 0 ? 'text-primary' : 'text-muted'}`}>{formatTaka(row.commission)}</span>
        </li>
      ))}
    </ul>
  );
}

function Partners({ report, onPartnerOpened }: { report: AdminEarningsReport; onPartnerOpened: () => void }) {
  const openPanel = useOrderPanelStore((state) => state.open);
  if (report.partners.length === 0) return <p className="p-[24px] text-center text-[14px] font-medium text-muted">এখনো কোনো অর্ডার সম্পন্ন হয়নি।</p>;

  return (
    <div className="mt-[4px] flex flex-col">
      {report.partners.map((partner) => (
        <button
          key={partner.providerId}
          type="button"
          onClick={() => {
            // The partner's details: their commission percent is changed there.
            openPanel(partner.userId, 'adminMember');
            onPartnerOpened();
          }}
          className="flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] p-[10px] text-left transition-colors hover:bg-surface"
        >
          <SupportAvatar name={partner.name} photo={null} />
          <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span className="flex items-center justify-between gap-[8px]">
              <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{partner.name}</span>
              <span className="shrink-0 text-[15px] font-semibold text-primary">{formatTaka(partner.commission)}</span>
            </span>
            <span className="flex items-center justify-between gap-[8px] text-[12px] font-medium text-muted">
              <span className="truncate">
                রেট {percent(partner.commissionRate)} · {bnNumber(partner.orders)}টি অর্ডার · বিল {formatTaka(partner.billed)}
              </span>
              <span className="shrink-0">এ মাসে {formatTaka(partner.thisMonth)}</span>
            </span>
            {partner.walletBalance !== 0 && (
              <span className={`text-[12px] font-semibold ${partner.walletBalance < 0 ? 'text-[#d64545]' : 'text-ink'}`}>
                {partner.walletBalance < 0 ? `Due ${formatTaka(-partner.walletBalance)}` : `ব্যালেন্স ${formatTaka(partner.walletBalance)}`}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
