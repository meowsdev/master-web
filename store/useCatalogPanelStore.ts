import { create } from 'zustand';

/**
 * Right-hand panels of the Services tab: one sub-service's details, the cart checkout, or the Custom request form.
 * They open from inside the chat canvas, far from useSuperAppModals, so their state lives here and that hook joins
 * it to the one-panel-at-a-time rule (AGENTS.md §9). Holds ids only, no data.
 */
export type CatalogPanelKind = 'mainService' | 'subService' | 'checkout' | 'custom';

interface CatalogPanelState {
  kind: CatalogPanelKind | null;
  /** The main service (chat) the panel belongs to. */
  mainServiceId: string | null;
  /** The sub-service shown by the details panel. */
  subServiceId: string | null;
  /** Overview, FAQ, How to order, Review and Details of a main service: opens with its chat. */
  openMainService: (mainServiceId: string) => void;
  openSubService: (mainServiceId: string, subServiceId: string) => void;
  openCheckout: (mainServiceId: string) => void;
  openCustom: (mainServiceId: string) => void;
  close: () => void;
}

export const useCatalogPanelStore = create<CatalogPanelState>((set) => ({
  kind: null,
  mainServiceId: null,
  subServiceId: null,
  openMainService: (mainServiceId) => set({ kind: 'mainService', mainServiceId, subServiceId: null }),
  openSubService: (mainServiceId, subServiceId) => set({ kind: 'subService', mainServiceId, subServiceId }),
  openCheckout: (mainServiceId) => set({ kind: 'checkout', mainServiceId, subServiceId: null }),
  openCustom: (mainServiceId) => set({ kind: 'custom', mainServiceId, subServiceId: null }),
  close: () => set({ kind: null, mainServiceId: null, subServiceId: null }),
}));
