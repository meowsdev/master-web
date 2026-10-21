import { apiClient } from '@/lib/axios';
import { ChatSession, Message, MessageType } from '@/types/chat.types';

export interface SendMessageDto {
  conversationId?: string;
  sessionId?: string;
  text?: string;
  fileUrl?: string;
  type?: MessageType;
}

export interface CreateConversationDto {
  serviceId?: string;
  providerId?: string;
  customerProfileId?: string;
}

export interface InChatBookingDto {
  conversationId: string;
  serviceId: string;
  providerId?: string;
  customPrice?: number;
  addressText?: string;
  preferredTime?: string;
  notes?: string;
  paymentMode?: 'CASH' | 'BKASH' | 'NAGAD' | 'CARD' | 'BANK';
}

export interface CustomOfferDto {
  conversationId: string;
  serviceId?: string;
  customPrice: number;
  description: string;
  duration?: string;
  expiresInHours?: number;
}

export const chatService = {
  getOrCreateConversation: async (dto: CreateConversationDto) => {
    const payload: Record<string, any> = {};
    if (dto.serviceId?.trim()) payload.serviceId = dto.serviceId.trim();
    if (dto.providerId?.trim()) payload.providerId = dto.providerId.trim();
    if (dto.customerProfileId?.trim()) payload.customerProfileId = dto.customerProfileId.trim();

    const response = await apiClient.post<ChatSession>(
      '/chat/conversations',
      payload
    );
    return response.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await apiClient.get<Message[]>(
      `/chat/conversations/${conversationId}/messages`
    );
    return response.data;
  },

  sendMessage: async (dto: SendMessageDto) => {
    const conversationId = dto.conversationId || dto.sessionId;
    const payload: Record<string, any> = {
      conversationId: conversationId!,
      type: dto.type || MessageType.TEXT,
    };
    if (dto.text?.trim()) {
      payload.text = dto.text.trim();
    }
    if (dto.fileUrl?.trim()) {
      payload.fileUrl = dto.fileUrl.trim();
    }
    const response = await apiClient.post<Message>('/chat/messages', payload);
    return response.data;
  },

  createInChatBooking: async (dto: InChatBookingDto) => {
    const response = await apiClient.post<{ order: any; message: Message }>(
      '/chat/orders/in-chat-booking',
      dto
    );
    return response.data;
  },

  sendCustomOffer: async (dto: CustomOfferDto) => {
    const offerPayload = JSON.stringify({
      type: 'OFFER',
      price: dto.customPrice,
      description: dto.description,
      duration: dto.duration || 'Standard Dispatch',
      expiresInHours: dto.expiresInHours || 24,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
    });

    const response = await apiClient.post<Message>('/chat/messages', {
      conversationId: dto.conversationId,
      type: MessageType.OFFER,
      text: offerPayload,
    });
    return response.data;
  },

  getUserConversations: async () => {
    const response = await apiClient.get<ChatSession[]>('/chat/conversations');
    return response.data;
  },

  assignProvider: async (conversationId: string, providerUserId: string) => {
    const response = await apiClient.post(
      `/chat/conversations/${conversationId}/assign-provider`,
      { userId: providerUserId }
    );
    return response.data;
  },

  setCounselorStatus: async (isOnline: boolean) => {
    const response = await apiClient.patch('/chat/counselor/status', {
      isOnline,
    });
    return response.data;
  },
};

