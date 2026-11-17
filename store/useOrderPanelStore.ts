import { create } from 'zustand';

export type ProviderPanelKind = 'assign' | 'extraCharge' | 'complete';

interface ProviderPanelState {
  /** Which order the open panel belongs to, so it never shows over another order. */
  orderId: string | null;
  kind: ProviderPanelKind | null;
  open: (orderId: string, kind: ProviderPanelKind) => void;
  close: () => void;
}

/**
 * The provider's job panels (assign worker, extra charge, work complete). They open from the + menu of
 * the message box, which is far from useSuperAppModals, so their state lives here and that hook
 * joins it to the one-panel-at-a-time rule. Holds ids only, no data.
 */
export const useProviderPanelStore = create<ProviderPanelState>((set) => ({
  orderId: null,
  kind: null,
  open: (orderId, kind) => set({ orderId, kind }),
  close: () => set({ orderId: null, kind: null }),
}));
