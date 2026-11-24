'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { ChipRow } from '../../ChipRow';
import { railIconClass } from '../../RailIconButton';
import { EarningsTab } from './EarningsTab';
import { LevelTab } from './LevelTab';

type Tab = 'EARNINGS' | 'LEVEL';
const TABS = [
  { id: 'EARNINGS', label: 'আয়' },
  { id: 'LEVEL', label: 'লেভেল' },
] as const;

/*
 * The provider's "আয় ও লেভেল" button: on the left rail on wide screens, in the profile header on phones.
 * Opens the right panel with two tabs: earnings and level.
 */
export function EarningsButton({ userId, variant }: { userId: string; /** rail: the left bar on wide screens; header: the profile header on phones, where the rail is hidden. */ variant: 'rail' | 'header' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('EARNINGS');

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="আয় ও লেভেল"
        aria-label="আয় ও লেভেল"
        className={
          variant === 'rail'
            ? railIconClass(isOpen)
            : 'relative flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-surface md:hidden'
        }
      >
        <HugeiconsIcon icon={Wallet01Icon} size={22} strokeWidth={variant === 'rail' && isOpen ? 2 : 1.7} />
      </button>

      {isOpen && (
        <SidePanelShell title="আয় ও লেভেল" onClose={() => setIsOpen(false)}>
          <div className="mb-[8px]">
            <ChipRow chips={TABS} activeId={tab} onSelect={setTab} label="আয় ও লেভেল" rowClassName="pb-[12px]" />
          </div>
          {tab === 'EARNINGS' ? <EarningsTab userId={userId} /> : <LevelTab userId={userId} />}
        </SidePanelShell>
      )}
    </>
  );
}
