import { apiClient } from '@/lib/axios';
import { MemberDetails, ModerationAction } from '@/types/admin-member.types';

/* Staff-only. The backend refuses everyone else and decides what each action is allowed to do. */
export interface NewMemberInput {
  mobileNumber: string;
  name?: string;
  companyName?: string;
  districtId?: number;
  upazilaId?: number;
}

export const adminMembersService = {
  /** Adds a provider or a customer; the backend keeps one role per phone number. */
  createMember: async (role: 'PROVIDER' | 'CUSTOMER', input: NewMemberInput) => (await apiClient.post<{ id: string; role: string }>('/admin/members', { role, ...input })).data,

  /** Adds a technician, optionally under a provider (a provider profile id). Admin only. */
  createTechnician: async (input: { mobileNumber: string; name: string; providerAgencyId?: string }) =>
    (await apiClient.post<{ userId: string }>('/technician-profile', input)).data,

  /** Moves a technician to another provider, or to none (null). */
  changeTechnicianProvider: async (technicianProfileId: string, providerAgencyId: string | null) =>
    (await apiClient.patch(`/technician-profile/${technicianProfileId}/agency`, { providerAgencyId })).data,

  getDetails: async (memberId: string) => (await apiClient.get<MemberDetails>(`/admin/members/${memberId}`)).data,

  moderate: async (memberId: string, action: ModerationAction, reason?: string) =>
    (await apiClient.post<MemberDetails>(`/admin/members/${memberId}/moderation`, { action, ...(reason?.trim() ? { reason: reason.trim() } : {}) })).data,
};
