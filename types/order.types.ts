import { Service } from './service.types';

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMode {
  CASH = 'CASH',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  CARD = 'CARD',
  BANK = 'BANK',
}

export interface ProviderReview {
  id: string;
  orderId: string;
  providerId: string;
  customerId: string;
  customerRating: number;
  providerRating?: number;
  reviewComment?: string;
  continueWithProvider: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderUserProfile {
  id: string;
  name?: string | null;
  mobileNumber: string;
  profilePhoto?: string | null;
}

export interface OrderCustomer {
  id: string;
  userId: string;
  user?: OrderUserProfile;
}

export interface OrderProvider {
  id: string;
  userId: string;
  user?: OrderUserProfile;
}

export interface ServiceRevision {
  id: string;
  orderId: string;
  issueDescription: string;
  attachedImages?: string[];
  revisionStatus: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  warrantyExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  providerId: string;
  customerId: string;
  technicianId?: string | null;
  serviceId: string;
  service?: Service;
  customer?: OrderCustomer;
  provider?: OrderProvider;
  technician?: OrderProvider;
  originalPrice: string | number;
  adminCommission: string | number;
  additionalPrice: string | number;
  totalPrice: string | number;
  finalPrice?: string | number;
  priceEditCount: number;
  priceChangeCount?: number;
  advancePaid: string | number;
  dueAmount: string | number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  providerReview?: ProviderReview | null;
  revisions?: ServiceRevision[];
}

