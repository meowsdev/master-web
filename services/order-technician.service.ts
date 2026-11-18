import { apiClient } from '@/lib/axios';

export interface OrderTechnicianOption {
  /** The technician profile id the assign call is made with. */
  id: string;
  name: string | null;
  username: string | null;
  profilePhoto: string | null;
  /** false for a blocked or banned technician, who cannot take work. */
  isActive: boolean;
  /** Jobs (accepted or in progress) this technician already has. */
  activeJobs: number;
}

export interface OrderTechnicianList {
  currentTechnicianId: string | null;
  technicians: OrderTechnicianOption[];
}

/* The provider of the order (or an admin) picks one of the provider's own technicians. The backend repeats every check. */
export const orderTechnicianService = {
  list: async (orderId: string) => (await apiClient.get<OrderTechnicianList>(`/orders/${orderId}/technician`)).data,

  set: async (orderId: string, technicianId: string | null) => (await apiClient.put<{ orderId: string; technicianId: string | null }>(`/orders/${orderId}/technician`, { technicianId })).data,
};
