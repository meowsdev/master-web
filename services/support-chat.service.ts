import { apiClient } from '@/lib/axios';
import { MySupportThread, SupportDirectoryEntry, SupportMemberRole, SupportMessage } from '@/types/support-chat.types';

/* Direct chat between platform staff and a provider/customer. The backend decides who may see which thread. */
export const supportChatService = {
  getDirectory: async (role: SupportMemberRole, search: string) => {
    const response = await apiClient.get<SupportDirectoryEntry[]>('/support-chat/directory', {
      params: { role, ...(search.trim() ? { search: search.trim() } : {}) },
    });
    return response.data;
  },

  openThreadForMember: async (memberId: string) => {
    const response = await apiClient.post<{ threadId: string }>('/support-chat/threads', { memberId });
    return response.data;
  },

  getMine: async () => (await apiClient.get<MySupportThread>('/support-chat/me')).data,

  openOwnThread: async () => (await apiClient.post<{ threadId: string }>('/support-chat/me')).data,

  getMessages: async (threadId: string) =>
    (await apiClient.get<SupportMessage[]>(`/support-chat/threads/${threadId}/messages`)).data,

  sendMessage: async (threadId: string, text: string) =>
    (await apiClient.post<SupportMessage>(`/support-chat/threads/${threadId}/messages`, { text })).data,

  markRead: async (threadId: string) => {
    await apiClient.post(`/support-chat/threads/${threadId}/read`);
  },
};
