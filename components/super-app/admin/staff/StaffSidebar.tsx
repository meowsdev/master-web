'use client';

import { useMemo, useState } from 'react';
import { STAFF_ROLE_LABEL, useStaffAccounts } from '@/hooks/useStaffAccounts';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User } from '@/types/auth.types';
import { CustomerSidebarTop } from '../../CustomerSidebarTop';
import { SupportAvatar } from '../../support/SupportAvatar';
import { StaffSidebarHeader } from '../AdminProfileHeader';

/** The sidebar adds its own "All" chip first. */
const FILTERS = ['ম্যানেজার', 'সাপোর্ট', 'এইচআর', 'কাউন্সেলর', 'বন্ধ'] as const;

/* Admin's Staff tab: every office account (search, filter by position), + adds one, a row opens its details. */
export function StaffSidebar({ user, onStaffOpened, onOpenAuth }: { user: User; onStaffOpened: () => void; onOpenAuth: () => void }) {
  const { staff, isLoading } = useStaffAccounts(user.id);
  const openPanel = useOrderPanelStore((state) => state.open);
  const openId = useOrderPanelStore((state) => (state.kind === 'adminStaff' ? state.orderId : null));
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return staff
      .filter((person) => (filter === 'All' ? true : filter === 'বন্ধ' ? person.status !== 'ACTIVE' : STAFF_ROLE_LABEL[person.role] === filter))
      .filter((person) => !query || `${person.name ?? ''} ${person.mobileNumber}`.toLowerCase().includes(query));
  }, [staff, filter, searchQuery]);

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
        searchPlaceholder="নাম বা নম্বর দিয়ে খুঁজুন..."
        profileSlot={<StaffSidebarHeader user={user} action={{ label: 'নতুন স্টাফ যোগ করুন', onClick: () => openPanel(null, 'adminAddStaff') }} />}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[8px] pb-[8px]">
        {!isLoading && <p className="px-[10px] pb-[4px] pt-[8px] text-[13px] font-semibold text-muted">মোট স্টাফ: {visible.length.toLocaleString('bn-BD')}</p>}
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
        {!isLoading && visible.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-muted">কোনো স্টাফ পাওয়া যায়নি।</p>}
        {visible.map((person) => {
          const name = person.name || person.mobileNumber;
          const isOff = person.status !== 'ACTIVE';
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => {
                openPanel(person.id, 'adminStaff');
                onStaffOpened();
              }}
              className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] p-[10px] text-left transition-colors hover:bg-surface ${openId === person.id ? 'bg-surface' : ''}`}
            >
              <SupportAvatar name={name} photo={null} />
              <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="flex items-center justify-between gap-[8px]">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{name}</span>
                  <span className={`shrink-0 text-[12px] font-semibold ${isOff ? 'text-[#d64545]' : 'text-primary'}`}>{isOff ? 'বন্ধ' : STAFF_ROLE_LABEL[person.role] ?? person.role}</span>
                </span>
                <span className="truncate text-[13px] font-medium text-muted">
                  {person.mobileNumber}
                  {!person.isVerified && ' · এখনো লগইন করেননি'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
