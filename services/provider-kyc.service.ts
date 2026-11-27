import { apiClient } from '@/lib/axios';

export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type KycGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

/** A provider's verification. The three picture fields hold private file keys, shown only through `fileBlob`. */
export interface ProviderKyc {
  id: string;
  status: KycStatus;
  fullName: string | null;
  fatherName: string | null;
  motherName: string | null;
  gender: KycGender | null;
  contactPhone: string | null;
  /** The address on the NID. */
  districtId: number | null;
  upazilaId: number | null;
  postCode: string | null;
  addressDetail: string | null;
  nidNumber: string | null;
  tradeLicenseNo: string | null;
  nidFrontUrl: string | null;
  nidBackUrl: string | null;
  selfieUrl: string | null;
  emergencyContacts: EmergencyContact[];
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
}

export interface MyKyc {
  kyc: ProviderKyc | null;
  /** Approved, or a provider from before KYC still in their grace period. */
  canReceiveOrders: boolean;
  /** Until when an unverified provider from before KYC still gets orders; null when there is none. */
  graceUntil: string | null;
  hasServiceAreas: boolean;
  accountName: string | null;
  /** The login number, to start the form's phone field with. */
  accountPhone: string | null;
}

export interface MemberKyc extends Omit<MyKyc, 'hasServiceAreas' | 'accountPhone'> {
  mobileNumber: string;
}

export interface SubmitKycRequest {
  fullName: string;
  fatherName: string;
  motherName: string;
  gender: KycGender;
  postCode: string;
  districtId: number;
  upazilaId: number;
  addressDetail: string;
  nidNumber: string;
  nidFrontKey: string;
  nidBackKey: string;
  selfieKey: string;
  tradeLicenseNo?: string;
  emergencyContacts: EmergencyContact[];
}

export const providerKycService = {
  getMine: async () => (await apiClient.get<MyKyc>('/provider-kyc/me')).data,

  /** A customer starts becoming a provider on the same number; then the KYC can be filled in. Safe to repeat. */
  apply: async () => (await apiClient.post<MyKyc>('/provider-kyc/apply')).data,

  /** One private picture; the returned key goes into the form. */
  uploadDocument: async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return (await apiClient.post<{ key: string }>('/provider-kyc/me/documents', body, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },

  submit: async (request: SubmitKycRequest) => (await apiClient.put<MyKyc>('/provider-kyc/me', request)).data,

  /** A private picture, fetched with the login (a plain <img src> could not prove who is looking). */
  fileBlob: async (key: string) => (await apiClient.get<Blob>(`/provider-kyc/files/${encodeURIComponent(key)}`, { responseType: 'blob' })).data,

  getForMember: async (userId: string) => (await apiClient.get<MemberKyc>(`/provider-kyc/member/${userId}`)).data,

  review: async (kycId: string, status: 'APPROVED' | 'REJECTED', reason?: string) =>
    (await apiClient.patch<ProviderKyc>(`/provider-kyc/${kycId}/status`, { status, reason })).data,
};
