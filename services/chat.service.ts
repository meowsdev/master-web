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

  setCounselorStatus: async (isOnline: boolean) => {
    const response = await apiClient.patch('/chat/counselor/status', {
      isOnline,
    });
    return response.data;
  },
};
