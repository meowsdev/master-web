import { apiClient } from '@/lib/axios';

export interface TeamTechnician {
  /** Technician profile id (the one Assign Worker uses). */
  id: string;
  name: string | null;
  username: string | null;
  profilePhoto: string | null;
  mobileNumber: string;
  /** false for a blocked or banned technician, who cannot take work. */
  isActive: boolean;
  /** Jobs (accepted or in progress) this technician has running. */
  activeJobs: number;
  createdAt: string;
}

export interface AddTechnicianRequest {
  /** Full international form, e.g. +8801711223344. */
  mobileNumber: string;
  name: string;
}

/* The signed-in provider's own technicians. The backend only ever reads or adds to the caller's team. */
export const providerTeamService = {
  list: async () => (await apiClient.get<TeamTechnician[]>('/technician-profile/my-team')).data,

  add: async (body: AddTechnicianRequest) =>
    (await apiClient.post<{ id: string; name: string; mobileNumber: string }>('/technician-profile/my-team', body)).data,
};
