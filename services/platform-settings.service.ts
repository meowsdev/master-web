import { apiClient } from '@/lib/axios';

/** The admin's one rule for orders providers create for their own customers: charge or not, and the percent. */
export interface ProviderOrderCharge {
  enabled: boolean;
  /** Percent (10 = 10%). */
  rate: number;
}

export const platformSettingsService = {
  /** The global commission on orders from the platform (providers without their own rate, e.g. new ones). */
  getPlatformOrderCommission: async () => (await apiClient.get<{ rate: number }>('/admin/platform-settings/platform-order-commission')).data,
  setPlatformOrderCommission: async (rate: number) =>
    (await apiClient.patch<{ rate: number }>('/admin/platform-settings/platform-order-commission', { rate })).data,

  getProviderOrderCharge: async () => (await apiClient.get<ProviderOrderCharge>('/admin/platform-settings/provider-order-charge')).data,
  setProviderOrderCharge: async (setting: ProviderOrderCharge) =>
    (await apiClient.patch<ProviderOrderCharge>('/admin/platform-settings/provider-order-charge', setting)).data,
};
