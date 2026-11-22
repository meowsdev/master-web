'use client';

import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { selectOpenOrderId, useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { RailTab } from '@/types/super-app.types';
import { ChatEmptyHeader } from '../ChatEmptyHeader';
import { AdminOrderWorkspace } from './AdminOrderWorkspace';
import { AdminPanels } from './AdminPanels';
import { useAdminOrders } from './AdminOrdersSidebar';
import { AdminSupportCanvas } from '../support/AdminSupportCanvas';
import { supportRoleForTab } from '../support/support-tabs';

/* Every staff member's main area: the selected order, or the empty landing canvas (always on the Services tab); management panels and the service form slide in on top. */
export function AdminCanvas({ userId, activeRailTab, onBack, onSwitchAccount }: { userId: string; activeRailTab: RailTab; onBack: () => void; onSwitchAccount: () => void }) {
  const { data: orders = [] } = useAdminOrders(userId);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(userId));
  const order = orders.find((item) => item.id === openOrderId);
  const { canManageServices, canChatWithMembers } = useStaffPermissions();
  // Services and Staff are management tabs: the canvas stays empty and their panels open on the right.
  const isServicesTab = (canManageServices && activeRailTab === 'SERVICES') || activeRailTab === 'STAFF';
  const supportRole = canChatWithMembers ? supportRoleForTab(activeRailTab) : null;

  return (
    <>
      {supportRole ? (
        <AdminSupportCanvas userId={userId} role={supportRole} onBack={onBack} onSwitchAccount={onSwitchAccount} />
      ) : !isServicesTab && order ? (
        <AdminOrderWorkspace key={order.id} order={order} userId={userId} onBack={onBack} />
      ) : (
        <>
          <ChatEmptyHeader onSwitchAccount={onSwitchAccount} menuItems={[]} />
          <div className="flex-1 bg-[#f7f5f3]" />
        </>
      )}
      <AdminPanels />
    </>
  );
}
