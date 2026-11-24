'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useAdminProviderLevel, useLevelTargets, useSetLevelTargets, useSetProviderLevel } from '@/hooks/useProviderLevelAdmin';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { LEVEL_REVIEW_WINDOW_DAYS } from '../../provider/earnings/earnings-format';
import { LevelTargetCards, LevelView } from '../../provider/earnings/LevelTab';

const secondaryButton = 'h-[40px] cursor-pointer rounded-[10px] border border-chip bg-white px-[16px] text-[14px] font-semibold text-ink hover:bg-surface';

/* The global level targets: one table for every provider, in the Level page's cards. Only an admin edits. */
export function LevelTargetsPanel({ adminId, onClose }: { adminId: string; onClose: () => void }) {
  const { canManageLevels } = useStaffPermissions();
  const { data: table, isLoading, isError } = useLevelTargets(adminId);
  const save = useSetLevelTargets(adminId);

  return (
    <SidePanelShell title="লেভেলের টার্গেট" onClose={onClose}>
      <p className="mb-[14px] text-[13px] font-medium leading-relaxed text-muted">
        এই টার্গেট সব প্রোভাইডারের জন্য। কোনো লেভেলে যেতে ছয়টা শর্তই পূরণ করতে হয়। বদলালে পরবর্তী মূল্যায়নে (বা &quot;এখনই হিসাব করুন&quot; চাপলে) নতুন টার্গেট দিয়ে সবার লেভেল হিসাব হবে।
      </p>
      {isLoading && <p className="text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">টার্গেট লোড করা যায়নি।</p>}
      {table && (
        <LevelTargetCards
          table={table}
          windowDays={LEVEL_REVIEW_WINDOW_DAYS}
          canEdit={canManageLevels}
          isSaving={save.isPending}
          onSave={(metric, values, done) => save.mutate({ metric, values }, { onSuccess: done })}
        />
      )}
    </SidePanelShell>
  );
}

/* One provider's Level page from the Levels tab: the page they see, with "Edit level" for an admin. */
export function ProviderLevelPanel({ adminId, providerUserId, onClose }: { adminId: string; providerUserId: string; onClose: () => void }) {
  const { canManageLevels, canViewMemberDetails } = useStaffPermissions();
  const openPanel = useOrderPanelStore((state) => state.open);
  const { data, isLoading, isError } = useAdminProviderLevel(adminId, providerUserId, true);
  const setLevel = useSetProviderLevel(adminId, providerUserId);

  return (
    <SidePanelShell title="প্রোভাইডারের লেভেল" onClose={onClose}>
      {isLoading && <p className="text-[14px] font-medium text-muted">লেভেল লোড হচ্ছে...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">লেভেল লোড করা যায়নি।</p>}
      {data && (
        <LevelView
          data={data}
          admin={canManageLevels ? { onSetLevel: (body, done) => setLevel.mutate(body, { onSuccess: done }), isSavingLevel: setLevel.isPending } : undefined}
        />
      )}
      {canViewMemberDetails && (
        <button type="button" onClick={() => openPanel(providerUserId, 'adminMember')} className={`${secondaryButton} mb-[16px] w-full`}>
          প্রোভাইডারের সব তথ্য দেখুন
        </button>
      )}
    </SidePanelShell>
  );
}
