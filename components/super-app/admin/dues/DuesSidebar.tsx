'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { adminDuesService } from '@/services/provider-wallet.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User } from '@/types/auth.types';
import { CustomerSidebarTop } from '../../CustomerSidebarTop';
import { SupportAvatar } from '../../support/SupportAvatar';
import { StaffSidebarHeader } from '../AdminProfileHeader';
import { bnNumber } from '../../provider/earnings/earnings-format';

/** The sidebar adds its own "All" chip first. */
const FILTERS = ['রিমাইন্ডার দরকার', 'অর্ডার বন্ধ'] as const;
const primaryButton = 'h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';

const errorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) ?? 'রিমাইন্ডার পাঠানো যায়নি';
};

/** Not reminded yet, or not within the automatic interval. */
const needsReminder = (lastReminderAt: string | null, intervalDays: number) =>
  !lastReminderAt || Date.now() - new Date(lastReminderAt).getTime() > intervalDays * 24 * 60 * 60 * 1000;

/** "আজ", "গতকাল", "৩ দিন আগে". */
const daysAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  return days <= 0 ? 'আজ' : days === 1 ? 'গতকাল' : `${bnNumber(days)} দিন আগে`;
};

/*
 * Dues tab: every provider who owes the platform (their cash jobs' commission), largest first. A reminder goes
 * into the provider's Support chat (it stays, unread) and pops up in their open app with Pay Now. Send it to one
 * provider (the bell), or to everyone listed, with your own words if you like. A daily run also reminds anyone
 * not reminded for a few days. A row opens the provider's details.
 */
export function DuesSidebar({ user, onPartnerOpened, onOpenAuth }: { user: User; onPartnerOpened: () => void; onOpenAuth: () => void }) {
  const queryClient = useQueryClient();
  const openPanel = useOrderPanelStore((state) => state.open);
  const openMemberId = useOrderPanelStore((state) => (state.kind === 'adminMember' ? state.orderId : null));
  const { data, isLoading, isError } = useQuery({ queryKey: ['admin-dues', user.id], queryFn: adminDuesService.list, refetchInterval: 30000 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [isComposing, setIsComposing] = useState(false);
  const [message, setMessage] = useState('');

  const remind = useMutation({
    mutationFn: adminDuesService.remind,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-dues', user.id] });
      toast.success(`${bnNumber(result.sent)} জনকে রিমাইন্ডার পাঠানো হয়েছে`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const intervalDays = data?.reminderIntervalDays ?? 3;

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (data?.providers ?? [])
      .filter((row) => (filter === 'All' ? true : filter === 'অর্ডার বন্ধ' ? row.isBlocked : needsReminder(row.lastReminderAt, intervalDays)))
      .filter((row) => !query || `${row.name} ${row.mobileNumber}`.toLowerCase().includes(query));
  }, [data, filter, searchQuery, intervalDays]);
  const visibleDue = visible.reduce((sum, row) => sum + row.dueAmount, 0);

  const sendToVisible = () =>
    remind.mutate(
      { providerIds: visible.map((row) => row.providerId), ...(message.trim() ? { message: message.trim() } : {}) },
      {
        onSuccess: () => {
          setIsComposing(false);
          setMessage('');
        },
      },
    );

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
        categoryNames={[...FILTERS]}
        isSearchCollapsed={false}
        searchPlaceholder="পার্টনার বা নম্বর দিয়ে খুঁজুন..."
        profileSlot={<StaffSidebarHeader user={user} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[8px]">
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
        {isError && <p className="p-[16px] text-center text-[14px] font-medium text-[#d64545]">ডিউ লিস্ট লোড করা যায়নি।</p>}

        {data && (
          <div className="mb-[8px] mt-[4px] rounded-[14px] bg-[#fdecec] p-[14px]">
            <p className="text-[13px] font-semibold text-ink">মোট পাওনা (Due)</p>
            <p className="text-[24px] font-semibold tracking-[-0.5px] text-[#d64545]">{formatTaka(data.totalDue)}</p>
            <p className="text-[12px] font-medium text-ink">
              {bnNumber(data.count)} জন পার্টনারের কাছে ·{' '}
              {data.isAutoReminderOn ? `${bnNumber(intervalDays)} দিন পরপর নিজে থেকে রিমাইন্ডার যায় (সকাল ১০টা)` : 'অটো রিমাইন্ডার বন্ধ'}
            </p>

            {!isComposing ? (
              <button type="button" disabled={visible.length === 0 || remind.isPending} onClick={() => setIsComposing(true)} className={`${primaryButton} mt-[10px]`}>
                {filter === 'All' && !searchQuery ? 'সবাইকে রিমাইন্ডার পাঠান' : `দেখানো ${bnNumber(visible.length)} জনকে রিমাইন্ডার`}
              </button>
            ) : (
              <div className="mt-[10px]">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="নিজের কথা লিখতে পারেন (ঐচ্ছিক)। খালি রাখলে সাধারণ মেসেজ যাবে। বকেয়ার অঙ্ক নিজে থেকেই যোগ হবে।"
                  className="w-full rounded-[8px] border border-line bg-white p-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary"
                  aria-label="Reminder message"
                />
                <p className="mt-[4px] text-[12px] font-medium text-muted">
                  {bnNumber(visible.length)} জন · মোট {formatTaka(visibleDue)} · তাদের সাপোর্ট চ্যাটে যাবে, অ্যাপ খোলা থাকলে সাথে সাথে দেখবে।
                </p>
                <div className="mt-[8px] flex gap-[8px]">
                  <button type="button" disabled={remind.isPending} onClick={sendToVisible} className={primaryButton}>
                    {remind.isPending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
                  </button>
                  <button type="button" onClick={() => setIsComposing(false)} className="h-[40px] cursor-pointer rounded-[10px] border border-line bg-white px-[16px] text-[14px] font-semibold text-ink hover:bg-surface">
                    বাদ দিন
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {data && visible.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-muted">{data.count === 0 ? 'কোনো পার্টনারের বকেয়া নেই।' : 'এই ফিল্টারে কেউ নেই।'}</p>}

        {visible.map((row) => (
          <div key={row.providerId} className={`flex items-center gap-[8px] rounded-[12px] p-[10px] transition-colors hover:bg-surface ${openMemberId === row.userId ? 'bg-surface' : ''}`}>
            <button
              type="button"
              onClick={() => {
                openPanel(row.userId, 'adminMember');
                onPartnerOpened();
              }}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] text-left"
            >
              <SupportAvatar name={row.name} photo={row.profilePhoto} />
              <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="flex items-center justify-between gap-[8px]">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{row.name}</span>
                  <span className="shrink-0 text-[15px] font-semibold text-[#d64545]">{formatTaka(row.dueAmount)}</span>
                </span>
                <span className="truncate text-[12px] font-medium text-muted">
                  {row.mobileNumber}
                  {row.isBlocked && ' · অর্ডার বন্ধ'}
                </span>
                <span className="truncate text-[12px] font-medium text-muted">
                  {row.lastReminderAt
                    ? `শেষ রিমাইন্ডার ${daysAgo(row.lastReminderAt)}${row.lastReminderWasAutomatic ? ' (অটো)' : ''} · মোট ${bnNumber(row.reminderCount)} বার`
                    : 'এখনো রিমাইন্ডার যায়নি'}
                </span>
              </span>
            </button>
            <button
              type="button"
              disabled={remind.isPending}
              onClick={() => remind.mutate({ providerIds: [row.providerId] })}
              title="রিমাইন্ডার পাঠান"
              aria-label={`${row.name}-কে রিমাইন্ডার পাঠান`}
              className="flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HugeiconsIcon icon={Notification03Icon} size={20} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
