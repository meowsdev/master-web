/** What the admin sees about a provider, technician or customer (GET /admin/members/:id). */
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
export type ModerationAction = 'RESTRICT' | 'UNRESTRICT' | 'BLOCK' | 'UNBLOCK' | 'BAN' | 'UNBAN';

export interface MemberPerson {
  id: string;
  name: string | null;
  username: string | null;
  mobileNumber: string;
  profilePhoto: string | null;
  status: MemberStatus;
}

export interface MemberTechnician extends MemberPerson {
  lastLoginAt: string | null;
}

import { ReceivedReview } from './review.types';

/** One review on a member's profile: who gave it, for which order, and what they said. */
export type MemberReview = ReceivedReview;

export interface ProviderSection {
  companyName: string | null;
  bio: string | null;
  rating: number;
  level: string;
  experienceYears: number;
  isAvailable: boolean;
  isBlockedForNegative: boolean;
  dueAmount: number;
  totalCompletedOrders: number;
  kyc: { status: string } | null;
  skillCount: number;
  areas: Array<{ districtId: number; upazilaId: number; name: string | null }>;
  technicians: MemberTechnician[];
  ordersByStatus: Record<string, number>;
  /** Reviews customers left on this provider's orders. */
  reviews: MemberReview[];
}

export interface TechnicianSection {
  /** What "change provider" is sent against. */
  profileId: string;
  lastLoginAt: string | null;
  orderCount: number;
  provider: { profileId: string | null; name: string | null; mobileNumber: string } | null;
  /** Reviews customers left on orders this technician did. */
  reviews: MemberReview[];
}

export interface CustomerOrderRow {
  id: string;
  referenceCode: string;
  orderStatus: string;
  totalPrice: number;
  createdAt: string;
  serviceName: string;
  providerName: string | null;
}

export interface CustomerSection {
  orderCount: number;
  ordersByStatus: Record<string, number>;
  totalSpent: number;
  /** Average rating providers gave this customer; 0 before the first one. */
  rating: number;
  /** Ratings providers and technicians gave this customer. */
  ratings: MemberReview[];
  recentOrders: CustomerOrderRow[];
  services: Array<{ name: string; count: number }>;
}

export interface MemberDetails extends MemberPerson {
  email: string | null;
  role: 'PROVIDER' | 'TECHNICIAN' | 'CUSTOMER';
  isRestricted: boolean;
  isVerified: boolean;
  area: string | null;
  createdAt: string;
  addresses: Array<{ addressText: string; isDefault: boolean }>;
  moderationLog: Array<{ action: ModerationAction; reason: string | null; createdAt: string }>;
  provider?: ProviderSection | null;
  technician?: TechnicianSection | null;
  customer?: CustomerSection;
}
