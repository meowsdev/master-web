import { apiClient } from '@/lib/axios';
import { ChatSession, Message, MessageType } from '@/types/chat.types';

export interface SendMessageDto {
  sessionId: string;
  text?: string;
  fileUrl?: string;
  type?: MessageType;
}

export interface CreateConversationDto {
  serviceId: string;
  providerId?: string;
}

export const chatService = {
  getOrCreateConversation: async (dto: CreateConversationDto) => {
    const response = await apiClient.post<ChatSession>(
      '/chat/conversations',
      dto
    );
    return response.data;
  },

  getMessages: async (sessionId: string) => {
    const response = await apiClient.get<Message[]>(
      `/chat/sessions/${sessionId}/messages`
    );
    return response.data;
  },

  sendMessage: async (dto: SendMessageDto) => {
    const response = await apiClient.post<Message>('/chat/messages', dto);
    return response.data;
  },

  setCounselorStatus: async (isOnline: boolean) => {
    const response = await apiClient.patch('/chat/counselor/status', {
      isOnline,
    });
    return response.data;
  },
};
