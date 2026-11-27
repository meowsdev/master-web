'use client';

import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { selectOpenOrderId, useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { RailTab } from '@/types/super-app.types';
import { ChatEmptyHeader } from '../ChatEmptyHeader';
import { AdminOrderWorkspace } from './AdminOrderWorkspace';
import { AdminPanels } from './AdminPanels';
import { ConversationHeader } from '../ConversationHeader';
import { useMainServiceView } from '@/components/modals/catalog/MainServiceDetailsPanel';
import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import { useAdminCatalogStore } from '@/store/useAdminCatalogStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { ServicesTab } from '../catalog/ServicesTab';
import { useAdminOrders } from './AdminOrdersSidebar';
import { AdminSupportCanvas } from '../support/AdminSupportCanvas';
import { supportRoleForTab } from '../support/support-tabs';

/* Every staff member's main area: the selected order, or the empty landing canvas (always on the Services tab); management panels and the service form slide in on top. */
export function AdminCanvas({ userId, activeRailTab, onBack, onSwitchAccount }: { userId: string; activeRailTab: RailTab; onBack: () => void; onSwitchAccount?: () => void }) {
  const { data: orders = [] } = useAdminOrders(userId);
  const openOrderId = useOrderHistoryStore(selectOpenOrderId(userId));
  const order = orders.find((item) => item.id === openOrderId);
  const { canManageServices, canChatWithMembers } = useStaffPermissions();
  // Services shows the catalog the way the customer sees it; Staff, Withdrawals, Earnings, Dues and Levels keep an empty canvas. Their panels open on the right.
  const isCatalogTab = canManageServices && activeRailTab === 'SERVICES';
  const isServicesTab = isCatalogTab || activeRailTab === 'STAFF' || activeRailTab === 'WITHDRAWALS' || activeRailTab === 'EARNINGS' || activeRailTab === 'DUES' || activeRailTab === 'LEVELS';
  const supportRole = canChatWithMembers ? supportRoleForTab(activeRailTab) : null;

  return (
    <>
      {supportRole ? (
        <AdminSupportCanvas userId={userId} role={supportRole} onBack={onBack} onSwitchAccount={onSwitchAccount} />
      ) : isCatalogTab ? (
        <CatalogCanvas onBack={onBack} onSwitchAccount={onSwitchAccount} />
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
function CatalogCanvas({ onBack, onSwitchAccount }: { onBack: () => void; onSwitchAccount?: () => void }) {
  const mainServiceId = useAdminCatalogStore((state) => state.mainServiceId);
  return (
    <>
      {mainServiceId ? (
        <MainServiceHeader key={mainServiceId} mainServiceId={mainServiceId} onBack={onBack} />
      ) : (
        <header className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-end gap-[12px] border-b border-line bg-white px-[16px]`}>
          {onSwitchAccount && (
            <button
              type="button"
              onClick={onSwitchAccount}
              className="h-[36px] cursor-pointer rounded-[10px] border border-ink bg-white px-[14px] text-[14px] font-semibold text-ink transition-colors hover:bg-surface"
            >
              Switch Account
            </button>
          )}
        </header>
      )}
      {mainServiceId ? (
        <ServicesTab key={mainServiceId} mainServiceId={mainServiceId} isAuthenticated onRequireAuth={() => {}} canEdit />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-white text-[15px] font-medium text-muted">বাম পাশ থেকে একটা সার্ভিস বাছুন</div>
      )}
    </>
  );
}

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/*
 * The open main service, as a customer's or provider's chat shows it: picture, name and star rating. The name opens
 * its details on the right, where staff also edit it (name, description, icon, category, publish).
 */
function MainServiceHeader({ mainServiceId, onBack }: { mainServiceId: string; onBack: () => void }) {
  const openMainService = useCatalogPanelStore((state) => state.openMainService);
  const { data } = useMainServiceView(mainServiceId);
  const picture = data?.iconUrl ?? null;
  const average = data?.rating?.average ?? null;
  const openDetails = () => openMainService(mainServiceId);

  return (
    <ConversationHeader
      picture={
        <span className="flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[18px]">
          {picture && isImageSource(picture) ? (
            // eslint-disable-next-line @next/next/no-img-element -- pictures come from arbitrary upload hosts
            <img src={picture} alt="" className="size-full object-cover" />
          ) : (
            <span aria-hidden>{picture || '🛠️'}</span>
          )}
        </span>
      }
      title={data?.name ?? '...'}
      ratingLabel={average !== null ? average.toFixed(1) : 'New'}
      backLabel="Back to services"
      onBack={onBack}
      onOpenTitle={openDetails}
      menuItems={[{ label: 'Service info & edit', onSelect: openDetails }]}
    />
  );
}
