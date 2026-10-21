import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { Message } from '@/types/chat.types';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocketBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  // Strip trailing /api/v1 or /api/v1/ to get the base origin
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

export const getChatSocket = (explicitToken?: string): Socket | null => {
  const token = explicitToken || useAuthStore.getState().accessToken;

  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentToken = null;
    }
    return null;
  }

  // If socket exists and token matches, return existing socket
  if (socket && currentToken === token && socket.connected) {
    return socket;
  }

  // If token changed, disconnect old socket
  if (socket && currentToken !== token) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  const baseUrl = getSocketBaseUrl();

  socket = io(`${baseUrl}/chat`, {
    auth: {
      token,
    },
    query: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('⚡ Chat WebSocket connected:', socket?.id);
  });

  socket.on('connect_error', (error) => {
    console.warn('⚠️ Chat WebSocket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Chat WebSocket disconnected:', reason);
  });

  return socket;
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};
