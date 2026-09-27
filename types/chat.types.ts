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
  messages?: Message[];
}
