export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  OFFER = 'OFFER',
  SYSTEM = 'SYSTEM',
}

export enum ChatTabCategory {
  SERVICE = 'SERVICE',
  ORDER = 'ORDER',
  SUPPORT = 'SUPPORT',
}

export enum ChatFlowType {
  CUSTOMER_PROVIDER = 'CUSTOMER_PROVIDER',
  CUSTOMER_COUNSELOR = 'CUSTOMER_COUNSELOR',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
}

export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  text?: string | null;
  fileUrl?: string | null;
  type: MessageType;
  isRead: boolean;
  isSend: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  customerId: string;
  counselorId?: string | null;
  providerId?: string | null;
  customerProfileId: string;
  serviceId: string;
  tabCategory: ChatTabCategory;
  flowType: ChatFlowType;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
    description?: string | null;
    basePrice?: number | string | null;
    durationMin?: number | null;
    category?: {
      id: string;
      name: string;
    } | null;
  };
  customerUser?: {
    id: string;
    name?: string | null;
    mobileNumber?: string;
    profilePhoto?: string | null;
    role?: string;
  };
  counselorUser?: {
    id: string;
    name?: string | null;
    mobileNumber?: string;
    profilePhoto?: string | null;
  };
  providerUser?: {
    id: string;
    name?: string | null;
    mobileNumber?: string;
    profilePhoto?: string | null;
  };
  messages?: Message[];
  _count?: {
    messages: number;
  };
}
