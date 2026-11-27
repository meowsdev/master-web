'use client';

import { useMemo, useState } from 'react';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useLevelProviders, useLevelStats, useRunLevelEvaluation, useSetLevelForMany } from '@/hooks/useProviderLevelAdmin';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import type { User } from '@/types/auth.types';
import type { ProviderLevel } from '@/types/provider-earnings.types';
import { CustomerSidebarTop } from '../../CustomerSidebarTop';
import { SupportAvatar } from '../../support/SupportAvatar';
import { StaffSidebarHeader } from '../AdminProfileHeader';
import { LEVEL_LABEL, bnNumber } from '../../provider/earnings/earnings-format';
import { LevelChip } from '../../provider/earnings/LevelTab';

const LEVELS: ProviderLevel[] = ['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'TOP_RATED'];
const LOCKED_FILTER = 'লক করা';
/** The sidebar adds its own "All" chip first. */
const FILTERS = [...LEVELS.map((level) => LEVEL_LABEL[level]), LOCKED_FILTER];

const primaryButton =
  'h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';
const secondaryButton = 'h-[40px] cursor-pointer rounded-[10px] border border-chip bg-white px-[16px] text-[14px] font-semibold text-ink hover:bg-surface';
const inputClass = 'h-[40px] w-full rounded-[8px] border border-chip bg-white px-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary';

/*
 * Levels tab: every provider's level in one place. Counts per level, the global targets (one table for everyone,
 * opened on the right), "work out levels now", and a list to filter by level or lock. An admin ticks providers and
 * gives them all a level at once (locked, the monthly evaluation leaves it). A row opens that provider's Level page.
 */
export function LevelsSidebar({ user, onOpened, onOpenAuth }: { user: User; onOpened: () => void; onOpenAuth: () => void }) {
  const { canManageLevels } = useStaffPermissions();
  const openPanel = useOrderPanelStore((state) => state.open);
  const openKind = useOrderPanelStore((state) => state.kind);
  const openTarget = useOrderPanelStore((state) => state.orderId);
  const { data: providers = [], isLoading, isError } = useLevelProviders(user.id);
  const { data: stats } = useLevelStats(user.id, true);
  const run = useRunLevelEvaluation(user.id);
  const setMany = useSetLevelForMany(user.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLevel, setBulkLevel] = useState<ProviderLevel>('LEVEL_1');
  const [bulkLocked, setBulkLocked] = useState(true);
  const [bulkReason, setBulkReason] = useState('');

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return providers
      .filter((row) => (filter === 'All' ? true : filter === LOCKED_FILTER ? row.isLevelLocked : LEVEL_LABEL[row.level] === filter))
      .filter((row) => !query || `${row.name} ${row.mobileNumber}`.toLowerCase().includes(query));
  }, [providers, filter, searchQuery]);

  const allVisibleSelected = visible.length > 0 && visible.every((row) => selected.has(row.userId));
  const toggle = (userId: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  const toggleAllVisible = () =>
    setSelected((previous) => {
      const next = new Set(previous);
      visible.forEach((row) => (allVisibleSelected ? next.delete(row.userId) : next.add(row.userId)));
      return next;
    });

  const applyBulk = () =>
    setMany.mutate(
      { userIds: [...selected], level: bulkLevel, isLocked: bulkLocked, reason: bulkLocked ? bulkReason.trim() || undefined : undefined },
      {
        onSuccess: () => {
          setSelected(new Set());
          setBulkReason('');
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
        categoryNames={FILTERS}
        isSearchCollapsed={false}
        searchPlaceholder="প্রোভাইডার বা নম্বর দিয়ে খুঁজুন..."
        profileSlot={<StaffSidebarHeader user={user} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[8px]">
        <section className="mb-[8px] mt-[4px] rounded-[14px] bg-secondary/40 p-[14px]">
          <p className="text-[13px] font-semibold text-ink">লেভেল অনুযায়ী প্রোভাইডার</p>
          <div className="mt-[8px] grid grid-cols-4 gap-[6px] text-center">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFilter(LEVEL_LABEL[level])}
                className={`cursor-pointer rounded-[10px] bg-white px-[4px] py-[8px] ${filter === LEVEL_LABEL[level] ? 'ring-2 ring-primary' : ''}`}
              >
                <span className="block text-[18px] font-semibold text-ink">{stats ? bnNumber(stats.distribution[level] ?? 0) : '–'}</span>
                <span className="block text-[11px] font-medium text-muted">{LEVEL_LABEL[level]}</span>
              </button>
            ))}
          </div>
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            <button
              type="button"
              onClick={() => {
                openPanel('targets', 'adminLevelTargets');
                onOpened();
              }}
              className={primaryButton}
            >
              {canManageLevels ? 'লেভেলের টার্গেট সেট করুন' : 'লেভেলের টার্গেট দেখুন'}
            </button>
            {canManageLevels && (
              <button type="button" disabled={run.isPending} onClick={() => run.mutate()} className={secondaryButton}>
                {run.isPending ? 'হিসাব হচ্ছে...' : 'এখনই হিসাব করুন'}
              </button>
            )}
            {/* Admin only: who gets new orders first (the backend allows only ADMIN too). */}
            {canManageLevels && (
              <button
                type="button"
                onClick={() => {
                  openPanel(null, 'adminDispatchRanking');
                  onOpened();
                }}
                className={secondaryButton}
              >
                অর্ডার বণ্টনের নিয়ম
              </button>
            )}
          </div>
          <p className="mt-[8px] text-[12px] font-medium text-muted">
            টার্গেট সব প্রোভাইডারের জন্য একটাই। প্রতি মাসের ১ তারিখে নিজে থেকে লেভেল হিসাব হয়; লক করা লেভেল বদলায় না।
          </p>
        </section>

        {canManageLevels && visible.length > 0 && (
          <label className="flex cursor-pointer items-center gap-[8px] px-[10px] py-[8px] text-[13px] font-semibold text-ink">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="size-[16px] cursor-pointer accent-primary" />
            দেখানো সবাইকে নির্বাচন ({bnNumber(visible.length)})
          </label>
        )}

        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
        {isError && <p className="p-[16px] text-center text-[14px] font-medium text-[#d64545]">প্রোভাইডার লিস্ট লোড করা যায়নি।</p>}
        {!isLoading && visible.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-muted">এই ফিল্টারে কেউ নেই।</p>}

        {visible.map((row) => {
          const isOpen = openKind === 'adminProviderLevel' && openTarget === row.userId;
          return (
            <div key={row.userId} className={`flex items-center gap-[10px] rounded-[12px] p-[10px] transition-colors hover:bg-surface ${isOpen ? 'bg-surface' : ''}`}>
              {canManageLevels && (
                <input
                  type="checkbox"
                  checked={selected.has(row.userId)}
                  onChange={() => toggle(row.userId)}
                  aria-label={`${row.name} নির্বাচন`}
                  className="size-[16px] shrink-0 cursor-pointer accent-primary"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  openPanel(row.userId, 'adminProviderLevel');
                  onOpened();
                }}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] text-left"
              >
                <SupportAvatar name={row.name} photo={row.profilePhoto} />
                <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <span className="flex items-center justify-between gap-[8px]">
                    <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{row.name}</span>
                    <LevelChip level={row.level} isLocked={row.isLevelLocked} />
                  </span>
                  <span className="truncate text-[12px] font-medium text-muted">
                    {row.mobileNumber} · {bnNumber(row.totalCompletedOrders)} কাজ{row.rating > 0 ? ` · ★ ${bnNumber(row.rating, 1)}` : ''}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {canManageLevels && selected.size > 0 && (
        <div className="shrink-0 border-t border-line bg-white px-[16px] py-[12px]">
          <p className="text-[13px] font-semibold text-ink">{bnNumber(selected.size)} জন নির্বাচিত: একসাথে লেভেল দিন</p>
          <div className="mt-[8px] flex gap-[8px]">
            <select value={bulkLevel} onChange={(event) => setBulkLevel(event.target.value as ProviderLevel)} className={`${inputClass} cursor-pointer`} aria-label="লেভেল">
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {LEVEL_LABEL[level]}
                </option>
              ))}
            </select>
            <label className="flex shrink-0 cursor-pointer items-center gap-[6px] text-[13px] font-medium text-ink">
              <input type="checkbox" checked={bulkLocked} onChange={(event) => setBulkLocked(event.target.checked)} className="size-[16px] cursor-pointer accent-primary" />
              লক
            </label>
          </div>
          {bulkLocked && (
            <input value={bulkReason} maxLength={300} onChange={(event) => setBulkReason(event.target.value)} placeholder="কারণ (প্রোভাইডার দেখবেন, ঐচ্ছিক)" className={`${inputClass} mt-[8px]`} />
          )}
          <p className="mt-[6px] text-[12px] font-medium text-muted">
            {bulkLocked ? 'লক থাকলে মাসিক হিসাবে এই লেভেল বদলাবে না।' : 'লক ছাড়া দিলে পরবর্তী মূল্যায়নে আবার হিসাব হবে (আগের লকও খুলে যাবে)।'}
          </p>
          <div className="mt-[8px] flex gap-[8px]">
            <button type="button" disabled={setMany.isPending} onClick={applyBulk} className={primaryButton}>
              {setMany.isPending ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className={secondaryButton}>
              বাতিল
            </button>
          </div>
        </div>
      )}
    </>
  );
}
