'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { useAdminProviderLevel, useSetProviderLevel } from '@/hooks/useProviderLevelAdmin';
import { LevelView } from '../../provider/earnings/LevelTab';
import { LEVEL_LABEL } from '../../provider/earnings/earnings-format';
import type { ProviderLevel } from '@/types/provider-earnings.types';
import { Section } from './MemberParts';

/*
 * A provider's Level page inside their details panel: the very page the provider sees (LevelView). Staff with
 * member details can open it; an admin (canManageLevels) can also give this provider a level. The targets are
 * global, edited in the Levels tab.
 */
export function ProviderLevelSection({ adminId, providerUserId, level, canEdit }: { adminId: string; providerUserId: string; level: string; canEdit: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError } = useAdminProviderLevel(adminId, providerUserId, isOpen);
  const setLevel = useSetProviderLevel(adminId, providerUserId);

  return (
    <Section title="লেভেল">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between rounded-[10px] bg-surface px-[12px] py-[10px] text-[14px] font-semibold text-ink hover:bg-secondary/40"
      >
        {LEVEL_LABEL[level as ProviderLevel] ?? level}
        <span className="flex items-center gap-[4px] text-[13px] text-primary">
          {isOpen ? 'বন্ধ করুন' : canEdit ? 'দেখুন ও এডিট করুন' : 'বিস্তারিত দেখুন'}
          <HugeiconsIcon icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon} size={16} />
        </span>
      </button>

      {isOpen && (
        <div className="mt-[16px]">
          {isLoading && <p className="text-[14px] font-medium text-muted">লেভেল লোড হচ্ছে...</p>}
          {isError && <p className="text-[14px] font-medium text-[#d64545]">লেভেল লোড করা যায়নি।</p>}
          {data && (
            <LevelView
              data={data}
              admin={
                canEdit
                  ? {
                      onSetLevel: (body, done) => setLevel.mutate(body, { onSuccess: done }),
                      isSavingLevel: setLevel.isPending,
                    }
                  : undefined
              }
            />
          )}
        </div>
      )}
    </Section>
  );
}
