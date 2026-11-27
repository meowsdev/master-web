import { apiClient } from '@/lib/axios';

/** The nine factors of a provider's dispatch score (backend: order-dispatch/ranking-rules.ts). */
export const RANKING_FACTORS = ['responseRate', 'responseSpeed', 'successScore', 'rating', 'behaviour', 'level', 'experience', 'workload', 'newcomer'] as const;
export type RankingFactor = (typeof RANKING_FACTORS)[number];
/** How much each factor counts: 0 (left out) to 10. */
export type RankingWeights = Record<RankingFactor, number>;
export type RankingPresetId = 'BALANCED' | 'RESPONSE_FIRST' | 'QUALITY_FIRST' | 'FAIR_SHARE';

export interface DispatchSettings {
  /** Off: new orders go to providers by rating, as before. On: by dispatch score. */
  isEnabled: boolean;
  weights: RankingWeights;
  presets: Record<RankingPresetId, RankingWeights>;
}

export interface DispatchPreviewProvider {
  providerId: string;
  name: string;
  position: number;
  /** Which group of offers they are in (1 = asked first). */
  wave: number;
  /** null: their numbers were not worked out yet (counted as middling). */
  score: number | null;
  /** Points each factor gave, adding up to the score. */
  parts: Record<RankingFactor, number> | null;
}

export interface DispatchPreview {
  /** Where the providers were found: the upazila, or the district when none covers the upazila. */
  area: 'UPAZILA' | 'DISTRICT' | 'ANY';
  providersPerWave: number;
  providers: DispatchPreviewProvider[];
}

export const dispatchRankingService = {
  get: async () => (await apiClient.get<DispatchSettings>('/admin/dispatch-ranking')).data,
  update: async (body: { isEnabled: boolean; weights: RankingWeights }) =>
    (await apiClient.put<Omit<DispatchSettings, 'presets'>>('/admin/dispatch-ranking', body)).data,
  preview: async (body: { serviceId: string; districtId?: number; upazilaId?: number; weights: RankingWeights }) =>
    (await apiClient.post<DispatchPreview>('/admin/dispatch-ranking/preview', body)).data,
  refresh: async () => (await apiClient.post<{ refreshed: number; failed: number }>('/admin/dispatch-ranking/refresh')).data,
};
