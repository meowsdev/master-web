import { apiClient } from '@/lib/axios';

export interface TermsSection {
  heading: string;
  points: string[];
}

/** One version of the provider terms (conduct and liability). Published versions are never edited. */
export interface ProviderTerms {
  version: number;
  title: string;
  sections: TermsSection[];
  /** null for the built-in version 1. */
  publishedAt: string | null;
}

export interface MyTerms {
  terms: ProviderTerms;
  acceptedVersion: number | null;
  /** A verified provider who has not accepted the current version yet. */
  needsAcceptance: boolean;
}

export const providerTermsService = {
  current: async () => (await apiClient.get<ProviderTerms>('/provider-terms/current')).data,
  mine: async () => (await apiClient.get<MyTerms>('/provider-terms/me')).data,
  accept: async (version: number) => (await apiClient.post<MyTerms>('/provider-terms/accept', { version })).data,
  /** Admin: every version, newest first. */
  versions: async () => (await apiClient.get<ProviderTerms[]>('/admin/provider-terms')).data,
  /** Admin: publish a new version (approved providers are asked to accept it on their next visit). */
  publish: async (body: { title: string; sections: TermsSection[] }) => (await apiClient.post<ProviderTerms>('/admin/provider-terms', body)).data,
};
