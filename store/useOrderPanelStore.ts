import { create } from 'zustand';

/** orderDetails: everything about one order (who, what, where, money, reviews), for every role. assign / extraCharge / complete: the provider's job panels. adminMember: one provider/technician/customer's details (orderId holds the member's user id). adminAddMember: the form that adds one (orderId holds the role: PROVIDER, TECHNICIAN or CUSTOMER). adminOrder: the admin's new-order form (orderId is null). adminAssign: send an unaccepted order to a provider (orderId holds the order id). advance: the customer's Pay Now panel. admin*: the admin's management panels (orderId is null, except adminService where it holds the service id, or 'new' / 'new:<categoryId>' while creating one under a main service). */
export type OrderPanelKind = 'orderDetails' | 'assign' | 'extraCharge' | 'complete' | 'advance' | 'adminService' | 'adminCategory' | 'adminProviders'  | 'adminMember' | 'adminAddMember' | 'adminOrder' | 'adminAssign';

interface ProviderPanelState {
  /** Which order the open panel belongs to, so it never shows over another order. */
  orderId: string | null;
  kind: OrderPanelKind | null;
  open: (orderId: string | null, kind: OrderPanelKind) => void;
  close: () => void;
}

/**
 * Right-hand panels that belong to one order (the provider's assign / extra charge / work complete, the
 * customer's advance payment). They open from inside a chat, far from useSuperAppModals, so their state
 * lives here and that hook joins it to the one-panel-at-a-time rule. Holds ids only, no data.
 */
export const useOrderPanelStore = create<ProviderPanelState>((set) => ({
  orderId: null,
  kind: null,
  open: (orderId, kind) => set({ orderId, kind }),
  close: () => set({ orderId: null, kind: null }),
}));
