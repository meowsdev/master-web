import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';
import { broadcastAuthEvent } from '@/lib/auth-channel';
import { queryClient } from '@/lib/query-client';
import { disconnectChatSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { useSupportChatStore } from '@/store/useSupportChatStore';

const REFRESH_LOCK_NAME = 'master-auth-refresh';

let inFlightRefresh: Promise<boolean> | null = null;
let lastRefreshCompletedAt = 0;

/** Called when ANY tab (this one or another) finished a successful refresh. */
export function markSessionRefreshed() {
  lastRefreshCompletedAt = Date.now();
}

/**
 * Refreshes the session cookies. Resolves `true` on success and `false` only
 * when the server says the session is really gone (401). Network/server
 * errors reject so callers do NOT log the user out because of a bad connection.
 *
 * Single-flight: concurrent callers in this tab share one request, and the Web
 * Lock serializes tabs so a second tab reuses the first tab's fresh cookies
 * instead of rotating again.
 */
export function refreshSession(): Promise<boolean> {
  inFlightRefresh ??= requestRefreshExclusively().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

function requestRefreshExclusively(): Promise<boolean> {
  const requestedAt = Date.now();

  const run = async () => {
    // Another tab refreshed while we waited for the lock: cookies are fresh.
    if (lastRefreshCompletedAt >= requestedAt) return true;
    return callRefreshEndpoint();
  };

  if (typeof navigator !== 'undefined' && navigator.locks) {
    // async wrapper flattens the lock's Promise<Promise<boolean>> typing
    return (async () => navigator.locks.request(REFRESH_LOCK_NAME, run))();
  }
  return run();
}

async function callRefreshEndpoint(): Promise<boolean> {
  // Plain axios (not apiClient): the refresh call must never go through the
  // 401 interceptor, otherwise a failing refresh would retry itself forever.
  const legacyRefreshToken = useAuthStore.getState().refreshToken;

  try {
    const response = await axios.post<{
      accessToken?: string;
      refreshToken?: string;
    }>(
      `${API_BASE_URL}/auth/refresh`,
      legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {},
      { withCredentials: true },
    );

    // Only legacy (body-token) sessions get tokens back; cookie sessions don't.
    const { accessToken, refreshToken } = response.data;
    if (accessToken && refreshToken) {
      useAuthStore.getState().setLegacyTokens(accessToken, refreshToken);
    }

    markSessionRefreshed();
    broadcastAuthEvent('REFRESHED');
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return false;
    }
    throw error;
  }
}

interface EndSessionOptions {
  /** Tell the other tabs (false when this call is itself reacting to a tab message). */
  broadcast?: boolean;
  redirect?: boolean;
}

/**
 * Wipes everything user-specific from this tab (AGENTS.md §7): auth store,
 * React Query cache, the user's chat storage, and the live socket.
 */
export function endLocalSession({
  broadcast = true,
  redirect = true,
}: EndSessionOptions = {}) {
  const previousUserId = useAuthStore.getState().user?.id;

  useAuthStore.getState().logout();
  queryClient.clear();
  disconnectChatSocket();
  useSupportChatStore.getState().reset();

  if (previousUserId) {
    try {
      localStorage.removeItem(`master_msgs_${previousUserId}`);
      localStorage.removeItem(`master_act_${previousUserId}`);
    } catch {
      // storage unavailable
    }
  }

  if (broadcast) broadcastAuthEvent('LOGOUT');

  // The login surface of this app is the main screen (AuthModal on `/`).
  if (redirect && typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.replace('/');
  }
}
