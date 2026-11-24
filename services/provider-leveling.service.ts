import { apiClient } from '@/lib/axios';
import type { LevelMetricKey, LevelProviderRow, LevelStats, LevelTargetTable, ProviderLevel, ProviderLevelProgress } from '@/types/provider-earnings.types';

/* Staff side of provider levels. A provider's own page is providerWalletService.getLevel. */
export const providerLevelingService = {
  /** A provider's Level page, as they see it (by their user id). */
  getProviderLevel: async (userId: string) => (await apiClient.get<ProviderLevelProgress>(`/provider-leveling/providers/${userId}`)).data,

  /** Admin: give a provider a level by hand; locked, the monthly evaluation leaves it alone. */
  setProviderLevel: async (userId: string, body: { level: ProviderLevel; isLocked: boolean; reason?: string }) =>
    (await apiClient.patch<ProviderLevelProgress>(`/provider-leveling/providers/${userId}/level`, body)).data,

  /** Admin: what one metric needs at Level 1, Level 2 and Top Rated. Returns the whole table. */
  setTargets: async (metric: LevelMetricKey, values: Record<'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED', number>) =>
    (await apiClient.put<LevelTargetTable>('/provider-leveling/targets', { metric, ...values })).data,

  /** Admin: work out every provider's level now instead of waiting for the 1st. */
  runEvaluation: async () => (await apiClient.post<{ message: string; updatedCount: number }>('/provider-leveling/trigger')).data,

  /** Every provider with their level (the Levels tab). */
  listProviders: async () => (await apiClient.get<LevelProviderRow[]>('/provider-leveling/providers')).data,

  /** Admin: the same level for many providers at once. */
  setLevelForMany: async (body: { userIds: string[]; level: ProviderLevel; isLocked: boolean; reason?: string }) =>
    (await apiClient.patch<{ updatedCount: number }>('/provider-leveling/providers/level', body)).data,

  /** Each level's six targets (one table for every provider). */
  getTargets: async () => (await apiClient.get<LevelTargetTable>('/provider-leveling/targets')).data,

  getStats: async () => (await apiClient.get<LevelStats>('/provider-leveling/stats')).data,
};
