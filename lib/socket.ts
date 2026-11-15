import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { Message } from '@/types/chat.types';

import { API_BASE_URL } from '@/lib/api-config';
import { refreshSession } from '@/lib/auth-session';

let socket: Socket | null = null;
let currentToken: string | null = null;

// Cookie sessions have no JS-readable token, so identify them by this marker.
const COOKIE_SESSION_KEY = '__cookie_session__';

export const getSocketBaseUrl = (): string => {
  const apiUrl = API_BASE_URL;
  // Strip trailing /api/v1 or /api/v1/ to get the base origin
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

export const getChatSocket = (explicitToken?: string): Socket | null => {
  const { isAuthenticated, accessToken } = useAuthStore.getState();
  // Legacy sessions pass an explicit Bearer token; cookie sessions rely on the
  // httpOnly access_token cookie sent with the handshake.
  const legacyToken = explicitToken || accessToken || undefined;
  const sessionKey = legacyToken ?? COOKIE_SESSION_KEY;

  if (!legacyToken && !isAuthenticated) {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentToken = null;
    }
    return null;
  }

  // If socket exists and session matches, return existing socket
  if (socket && currentToken === sessionKey && socket.connected) {
    return socket;
  }

  // If the session changed, disconnect old socket
  if (socket && currentToken !== sessionKey) {
    socket.disconnect();
    socket = null;
  }

  currentToken = sessionKey;
  const baseUrl = getSocketBaseUrl();

  socket = io(`${baseUrl}/chat`, {
    withCredentials: true,
    ...(legacyToken ? { auth: { token: legacyToken }, query: { token: legacyToken } } : {}),
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
    // The handshake only checks the access cookie. If it expired, refresh the
    // session and reconnect with the new cookie instead of giving up.
    if (error.message === 'Unauthorized' && !useAuthStore.getState().accessToken) {
      refreshSession()
        .then((isAlive) => {
          if (isAlive) socket?.connect();
        })
        .catch(() => undefined);
    }
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
