import { apiClient } from '@/lib/axios';

export interface AdminProvider {
  id: string;
  companyName: string | null;
  rating: string | number;
  level: string;
  totalCompletedOrders: number;
  isAvailable: boolean;
  isBlockedForNegative: boolean;
  /** What the provider owes the platform. */
  dueAmount: number;
  kyc: { status: string } | null;
  user: { id: string; name: string | null; username: string | null; mobileNumber: string; status: string; profilePhoto: string | null };
  _count: { orders: number };
}

/** The fields an admin can set on a service. The backend validates each one. */
export interface AdminServiceInput {
  categoryId: string;
  name: string;
  nameBn?: string;
  description: string;
  basePrice: number;
  durationMin?: number;
  /** null clears the picture. */
  imageUrl?: string | null;
  features?: string[];
  isFixedPrice?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
}

/** Admin-only screens. Every call is checked by the backend's role guard; nothing here grants access. */
export const adminService = {
  createTechnician: async (dto: { name: string; mobileNumber: string; providerAgencyId?: string }) =>
    (await apiClient.post('/technician-profile', dto)).data,

  assignTechnicianAgency: async (technicianId: string, providerAgencyId: string | null) =>
    (await apiClient.patch(`/technician-profile/${technicianId}/agency`, { providerAgencyId })).data,

  listProviders: async () => (await apiClient.get<AdminProvider[]>('/admin/providers')).data,

  /** Upload an image file for a service or main service; returns the link to store on it. */
  uploadServicePicture: async (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return (await apiClient.post<{ url: string }>('/uploads/service-pictures', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data.url;
  },

  /** Store a chosen Hugeicons icon as a picture; the backend rebuilds the SVG from the icon data. */
  saveHugeicon: async (name: string, elements: unknown) => (await apiClient.post<{ url: string }>('/uploads/hugeicon', { name, elements })).data.url,

  createCategory: async (dto: { name: string; description?: string; iconUrl?: string }) => (await apiClient.post<{ id: string; name: string }>('/category/create', dto)).data,

  createService: async (dto: AdminServiceInput) => (await apiClient.post<{ id: string }>('/service/create', dto)).data,

  updateService: async (serviceId: string, dto: Partial<AdminServiceInput>) => (await apiClient.patch(`/service/${serviceId}`, dto)).data,
};
