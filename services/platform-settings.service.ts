import { apiClient } from '@/lib/axios';

/** The admin's one rule for orders providers create for their own customers: charge or not, and the percent. */
export interface ProviderOrderCharge {
  enabled: boolean;
  /** Percent (10 = 10%). */
  rate: number;
}

export const platformSettingsService = {
  getProviderOrderCharge: async () => (await apiClient.get<ProviderOrderCharge>('/admin/platform-settings/provider-order-charge')).data,
  setProviderOrderCharge: async (setting: ProviderOrderCharge) =>
    (await apiClient.patch<ProviderOrderCharge>('/admin/platform-settings/provider-order-charge', setting)).data,
};
