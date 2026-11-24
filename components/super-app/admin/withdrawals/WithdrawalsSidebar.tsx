'use client';

import { useMemo, useState } from 'react';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useAdminWithdrawals } from '@/hooks/useWithdrawals';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User } from '@/types/auth.types';
import { WithdrawalStatus } from '@/types/provider-earnings.types';
import { CustomerSidebarTop } from '../../CustomerSidebarTop';
import { SupportAvatar } from '../../support/SupportAvatar';
import { StaffSidebarHeader } from '../AdminProfileHeader';
import { bnDate } from '../../provider/earnings/earnings-format';
import { WITHDRAWAL_STATUS_CLASS, WITHDRAWAL_STATUS_LABEL, payoutDestination } from '../../provider/earnings/withdrawal-labels';

const STATUSES: WithdrawalStatus[] = ['PENDING', 'PAID', 'REJECTED', 'CANCELLED'];
/** The sidebar adds its own "All" chip first. */
const FILTERS = STATUSES.map((status) => WITHDRAWAL_STATUS_LABEL[status]);

export const providerDisplayName = (provider?: { companyName: string | null; user: { name: string | null; username: string | null; mobileNumber: string } }) =>
  provider ? provider.companyName || provider.user.name || provider.user.username || provider.user.mobileNumber : 'Provider';

/* Admin's Withdrawals tab: every provider's request (waiting ones first by default), a row opens it to pay or reject. */
export function WithdrawalsSidebar({ user, onWithdrawalOpened, onOpenAuth }: { user: User; onWithdrawalOpened: () => void; onOpenAuth: () => void }) {
  const { list } = useAdminWithdrawals(user.id);
  const openPanel = useOrderPanelStore((state) => state.open);
  const openId = useOrderPanelStore((state) => (state.kind === 'adminWithdrawal' ? state.orderId : null));
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>(WITHDRAWAL_STATUS_LABEL.PENDING);
  const withdrawals = useMemo(() => list.data ?? [], [list.data]);

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return withdrawals
      .filter((item) => filter === 'All' || WITHDRAWAL_STATUS_LABEL[item.status] === filter)
      .filter((item) => !query || `${providerDisplayName(item.provider)} ${item.provider?.user.mobileNumber ?? ''} ${item.accountNumber}`.toLowerCase().includes(query));
  }, [withdrawals, filter, searchQuery]);
  const waitingTotal = withdrawals.filter((item) => item.status === 'PENDING').reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <>
      <CustomerSidebarTop
        isAuthenticated
        user={user}
        onOpenAuth={onOpenAuth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => {}}
        onSearchBlur={() => {}}
        activeFilterChip={filter}
        onSelectFilterChip={setFilter}
        categoryNames={FILTERS}
        isSearchCollapsed={false}
        searchPlaceholder="পার্টনার বা নম্বর দিয়ে খুঁজুন..."
        profileSlot={<StaffSidebarHeader user={user} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[8px]">
        {!list.isLoading && (
          <p className="px-[10px] pb-[4px] pt-[8px] text-[13px] font-semibold text-muted">
            অপেক্ষমাণ মোট: {formatTaka(waitingTotal)} · দেখানো হচ্ছে {visible.length.toLocaleString('bn-BD')}টি
          </p>
        )}
        {list.isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
        {list.isError && <p className="p-[16px] text-center text-[14px] font-medium text-[#d64545]">লোড করা যায়নি।</p>}
        {!list.isLoading && !list.isError && visible.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-muted">কোনো উইথড্র রিকোয়েস্ট নেই।</p>}
        {visible.map((item) => {
          const name = providerDisplayName(item.provider);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                openPanel(item.id, 'adminWithdrawal');
                onWithdrawalOpened();
              }}
              className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] p-[10px] text-left transition-colors hover:bg-surface ${openId === item.id ? 'bg-surface' : ''}`}
            >
              <SupportAvatar name={name} photo={null} />
              <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="flex items-center justify-between gap-[8px]">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{name}</span>
                  <span className="shrink-0 text-[15px] font-semibold text-primary">{formatTaka(item.amount)}</span>
                </span>
                <span className="flex items-center justify-between gap-[8px]">
                  <span className="truncate text-[13px] font-medium text-muted">
                    {payoutDestination(item)} · {bnDate(item.createdAt)}
                  </span>
                  <span className={`shrink-0 rounded-full px-[8px] py-[1px] text-[11px] font-semibold ${WITHDRAWAL_STATUS_CLASS[item.status]}`}>{WITHDRAWAL_STATUS_LABEL[item.status]}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
