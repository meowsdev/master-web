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

export interface Order {
  id: string;
  providerId: string;
  customerId: string;
  technicianId?: string | null;
  serviceId: string;
  service?: Service;
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
}
