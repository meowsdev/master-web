import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/lib/api-config';
import { endLocalSession, refreshSession } from '@/lib/auth-session';
import { useAuthStore } from '@/store/useAuthStore';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Sessions live in httpOnly cookies, so every request must carry them.
  withCredentials: true,
});

type RetriableRequest = InternalAxiosRequestConfig & { _hasRetried?: boolean };

// A 401 from these means "wrong credentials", not "session expired".
const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  '/auth/refresh',
  '/auth/logout',
  '/auth/request-otp',
  '/auth/verify-otp',
  '/auth/technician-login',
];

function isExemptFromRefresh(url?: string): boolean {
  return AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => url?.includes(path));
}

// Request Interceptor: legacy (technician) sessions still send a Bearer token;
// cookie sessions have none and rely on the httpOnly cookies instead.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken, activeRole } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (activeRole && config.headers) {
      config.headers['x-active-role'] = activeRole;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: on 401, refresh silently once and replay the request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined;
    const shouldTryRefresh =
      error.response?.status === 401 &&
      request &&
      !request._hasRetried &&
      !isExemptFromRefresh(request.url) &&
      // Guests have nothing to refresh; their 401s are just "please log in".
      (useAuthStore.getState().isAuthenticated || Boolean(useAuthStore.getState().pendingRegistrationUser));

    if (!shouldTryRefresh) return Promise.reject(error);

    request._hasRetried = true;

    let isSessionAlive: boolean;
    try {
      isSessionAlive = await refreshSession();
    } catch {
      // Offline / server down: keep the session, surface the original error.
      return Promise.reject(error);
    }

    if (!isSessionAlive) {
      endLocalSession();
      return Promise.reject(error);
    }

    // Drop the stale Bearer header; the request interceptor re-adds the
    // current one (legacy sessions) or none (cookie sessions).
    delete request.headers.Authorization;
    return apiClient(request);
  }
);
