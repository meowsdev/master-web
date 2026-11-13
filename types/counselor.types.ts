import { Order, OrderStatus } from './order.types';

export type CounselorTab = 'PUBLIC' | 'ONGOING' | 'HOLD' | 'COMPLETED';

export interface AssignedProviderInfo {
  id: string;
  name: string;
  phone?: string;
  rating?: number;
  isHeld?: boolean;
}

export interface CounselorChatItem {
  id: string; // Order UUID or manual lead ID
  orderId?: string; // Short 8-char ID (e.g. #A1B2C3D4)
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  serviceId: string;
  serviceName: string;
  serviceIcon?: string;
  orderStatus: OrderStatus;
  totalPrice: number;
  advancePaid: number;
  dueAmount: number;
  assignedProvider?: AssignedProviderInfo | null;
  hasActiveRevision?: boolean;
  revisionIssue?: string;
  hasNegativeReview?: boolean;
  reviewRating?: number;
  reviewComment?: string;
  isReviewHidden?: boolean;
  isProviderHeld?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  tabCategory: CounselorTab;
  createdAt: string;
  order?: Order;
}

export interface CreateManualCustomerLeadDto {
  customerName: string;
  customerPhone: string;
  serviceId: string;
  address?: string;
  initialNote?: string;
}

export interface CounselorCreateOrderDto {
  serviceId: string;
  description: string;
  totalPrice: number;
  advancePercentage: number; // e.g. 10, 20, 50, 100
  advanceAmount: number;
  paymentMode: string;
  assignedProviderId?: string;
}
