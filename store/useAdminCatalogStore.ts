import { create } from 'zustand';

/** The main service the admin's Services tab shows in the middle, like the customer's open chat. Holds an id only. */
interface AdminCatalogState {
  mainServiceId: string | null;
  selectMainService: (id: string | null) => void;
}

export const useAdminCatalogStore = create<AdminCatalogState>((set) => ({
  mainServiceId: null,
  selectMainService: (mainServiceId) => set({ mainServiceId }),
}));
