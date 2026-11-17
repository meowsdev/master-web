import { create } from 'zustand';

/** assign / extraCharge / complete: the provider's job panels. advance: the customer's Pay Now panel. */
export type OrderPanelKind = 'assign' | 'extraCharge' | 'complete' | 'advance';

interface ProviderPanelState {
  /** Which order the open panel belongs to, so it never shows over another order. */
  orderId: string | null;
  kind: OrderPanelKind | null;
  open: (orderId: string, kind: OrderPanelKind) => void;
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
