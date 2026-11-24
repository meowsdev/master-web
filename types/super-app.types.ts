// Order Card details embedded within in-chat messages
export interface OrderCardData {
  id?: string; // Real UUID from database
  orderId: string; // Short display ID (e.g. #A1B2C3D4)
  serviceId: string;
  serviceName: string;
  serviceIcon?: string;
  address: string;
  scheduleTime: string;
  paymentMode: PaymentMode | string;
  basePrice: number | string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string;
  hasActiveRevision?: boolean;
  revisionIssue?: string;
  advancePaid?: number | string;
  dueAmount?: number | string;
  additionalPrice?: number | string;
  totalPrice?: number | string;
  hasPendingPriceEdit?: boolean;
  resolvedRevision?: boolean;
  needsSatisfactionConfirmation?: boolean;
}

// Message structure for in-chat conversations
export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'voice_call' | 'service_card' | 'order_card';
  reaction?: string;
  serviceCard?: {
    title: string;
    price: number | string;
    duration: string;
  };
  orderCard?: OrderCardData;
}

// Navigation Rail tab identifiers
/**
 * SUPPORT: a provider's or customer's chat with the platform staff.
 * SUPPORT_PROVIDERS / SUPPORT_TECHNICIANS / SUPPORT_CUSTOMERS: staff's three direct-chat lists.
 */
export type RailTab = 'CHATS' | 'ORDERS' | 'SERVICES' | 'SUPPORT' | 'SUPPORT_PROVIDERS' | 'SUPPORT_TECHNICIANS' | 'SUPPORT_CUSTOMERS' | 'STAFF' | 'WITHDRAWALS' | 'EARNINGS' | 'DUES';

/** What the rail marks as selected: a tab, or the right-hand panel that is currently open. */
export type RailSelection = RailTab | 'ACCOUNT';

// Custom filter list structure for WhatsApp Web user-created lists
export interface CustomFilterList {
  id: string;
  name: string;
  serviceIds: string[];
  createdAt: number;
}

// Filter chips available in WhatsApp Web sidebar (Groups replaced with Save)
export type StandardFilterChip = 'All' | 'Running' | 'Unread' | 'Favorites' | 'Save';
export type FilterChip = StandardFilterChip | string;

// Payment methods for in-chat service booking
export type PaymentMode = 'CASH' | 'BKASH' | 'NAGAD';

// Quick Dhaka Area presets for fast booking in chat
export const DHAKA_AREAS: string[] = [
  'Dhanmondi 27, Dhaka',
  'Gulshan-2 Circle, Dhaka',
  'Uttara Sector 7, Dhaka',
  'Mirpur-10 Roundabout, Dhaka',
  'Banani Road 11, Dhaka',
  'Mohammadpur Housing, Dhaka',
  'Bashundhara R/A Block C, Dhaka',
];
