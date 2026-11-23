'use client';

import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { selectOpenOrderId, useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { RailTab } from '@/types/super-app.types';
import { ChatEmptyHeader } from '../ChatEmptyHeader';
import { AdminOrderWorkspace } from './AdminOrderWorkspace';
import { AdminPanels } from './AdminPanels';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import { useAdminCatalogStore } from '@/store/useAdminCatalogStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { ServicesTab } from '../catalog/ServicesTab';
import { useAdminOrders } from './AdminOrdersSidebar';
import { AdminSupportCanvas } from '../support/AdminSupportCanvas';
import { supportRoleForTab } from '../support/support-tabs';

/* Every staff member's main area: the selected order, or the empty landing canvas (always on the Services tab); management panels and the service form slide in on top. */
export function AdminCanvas({ userId, activeRailTab, onBack, onSwitchAccount }: { userId: string; activeRailTab: RailTab; onBack: () => void; onSwitchAccount: () => void }) {
  const { data: orders = [] } = useAdminOrders(userId);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(userId));
  const order = orders.find((item) => item.id === openOrderId);
  const { canManageServices, canChatWithMembers } = useStaffPermissions();
  // Services shows the catalog the way the customer sees it; Staff keeps an empty canvas. Their panels open on the right.
  const isCatalogTab = canManageServices && activeRailTab === 'SERVICES';
  const isServicesTab = isCatalogTab || activeRailTab === 'STAFF';
  const supportRole = canChatWithMembers ? supportRoleForTab(activeRailTab) : null;

  return (
    <>
      {supportRole ? (
        <AdminSupportCanvas userId={userId} role={supportRole} onBack={onBack} onSwitchAccount={onSwitchAccount} />
      ) : isCatalogTab ? (
        <CatalogCanvas onSwitchAccount={onSwitchAccount} />
      ) : !isServicesTab && order ? (
        <AdminOrderWorkspace key={order.id} order={order} userId={userId} onBack={onBack} />
      ) : (
        <>
          <ChatEmptyHeader onSwitchAccount={onSwitchAccount} menuItems={[]} />
          <div className="flex-1 bg-surface" />
        </>
      )}
      <AdminPanels />
    </>
  );
}

/* Services tab: the customer's Services screen for the main service picked on the left, with the staff edit controls on. */
function CatalogCanvas({ onSwitchAccount }: { onSwitchAccount: () => void }) {
  const mainServiceId = useAdminCatalogStore((state) => state.mainServiceId);
  const openMainService = useCatalogPanelStore((state) => state.openMainService);
  return (
    <>
      <header className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-between gap-[12px] border-b border-line bg-white px-[16px]`}>
        {mainServiceId ? (
          <button
            type="button"
            onClick={() => openMainService(mainServiceId)}
            className="flex cursor-pointer items-center gap-[6px] rounded-[10px] px-[10px] py-[6px] text-[14px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={18} strokeWidth={1.6} />
            Edit main service
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onSwitchAccount}
          className="h-[36px] cursor-pointer rounded-[10px] border border-ink bg-white px-[14px] text-[14px] font-semibold text-ink transition-colors hover:bg-surface"
        >
          Switch Account
        </button>
      </header>
      {mainServiceId ? (
        <ServicesTab key={mainServiceId} mainServiceId={mainServiceId} isAuthenticated onRequireAuth={() => {}} canEdit />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-white text-[15px] font-medium text-muted">বাম পাশ থেকে একটা সার্ভিস বাছুন</div>
      )}
    </>
  );
}
