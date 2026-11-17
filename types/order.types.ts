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
  username?: string | null;
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
  /** Provider's average rating; 0 until the first review. */
  rating?: string | number;
  companyName?: string | null;
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

/** Payment record of an order. ONLINE means the provider asked for online payment and the customer has not paid yet. */
export interface OrderPaymentAndTip {
  paymentMode: PaymentMode | 'ONLINE';
  serviceAmountPaid: string | number;
  tipAmount: string | number;
  confirmationStatus: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'EXPIRED';
  createdAt: string;
}

/** Who is handling an order, as the backend words it for the customer. */
export interface OrderAssignee {
  /** "@hamid115", or null while no technician is assigned. */
  technician: string | null;
  /** Company name (priority) or "@username" of the provider. */
  provider: string | null;
  /** Technician first, else the provider. */
  primary: string | null;
  /** "@manik05"; null until a provider accepts. */
  providerUsername: string | null;
  /** The provider's company name, or their own name without a company; null until accepted. */
  providerName: string | null;
}

/** Who is coming for an accepted order; null while it is still pending. */
export interface OrderAssignmentCard {
  role: 'TECHNICIAN' | 'PROVIDER';
  name: string | null;
  photoUrl: string | null;
  workshopAddress: string | null;
  shopName: string | null;
}

export interface OrderPriceLine {
  label: string;
  unitPrice: number;
  count: number;
  amount: number;
}

export interface OrderBookingDetail {
  subServiceName: string;
  quantity: number;
  description?: string | null;
  addressDetail: string;
  /** YYYY-MM-DD (ISO date from the backend). */
  scheduledDate: string;
  timeSlot: string;
  priceBreakdown: OrderPriceLine[];
}

export interface Order {
  id: string;
  /** Random 6-character code (A-Z, 0-9) the customer quotes, e.g. A94K2B. */
  referenceCode: string;
  completedAt?: string | null;
  /** When a provider first took the order; null while it is pending. */
  acceptedAt?: string | null;
  assignee?: OrderAssignee;
  assignmentCard?: OrderAssignmentCard | null;
  /** Backend rule: running orders, or a completed one reopened by a revision. */
  isChatOpen?: boolean;
  bookingDetail?: OrderBookingDetail | null;
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
  paymentAndTip?: OrderPaymentAndTip | null;
  /** Early payments (before the final settlement), oldest first. */
  advancePayments?: Array<{
    amount: string | number;
    method: string;
    /** The bill and what was still due right after this payment; null on old records. */
    totalAtPayment?: string | number | null;
    dueAfter?: string | number | null;
    createdAt: string;
  }>;
  /** False while the order is only offered to providers (the provider on it is a stand-in); true once one accepted. */
  isAccepted?: boolean;
  /** Provider only: while a new order is offered to them, when their offer runs out. */
  myOfferExpiresAt?: string | null;
  /** Completed, not reviewed yet: the tab stays so the payment result and review card show. */
  isReviewPending?: boolean;
  revisions?: ServiceRevision[];
}

