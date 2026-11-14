'use client';

import { useEffect } from 'react';
import { subscribeToAuthEvents } from '@/lib/auth-channel';
import { endLocalSession, markSessionRefreshed } from '@/lib/auth-session';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Keeps this tab consistent with the session:
 *  - logout in any other tab logs this tab out too,
 *  - a refresh in another tab is noted (and legacy tokens re-read),
 *  - on load, a returning user is re-validated; the 401 interceptor silently
 *    refreshes an expired access token before this call is retried.
 */
export function useSessionSync() {
  useEffect(() => {
    const unsubscribe = subscribeToAuthEvents((message) => {
      if (message === 'LOGOUT') {
        endLocalSession({ broadcast: false, redirect: true });
        return;
      }
      markSessionRefreshed();
      // Legacy sessions keep rotated tokens in localStorage.
      void useAuthStore.persist.rehydrate();
    });

    if (useAuthStore.getState().isAuthenticated) {
      authService
        .getMe()
        .then((freshUser) => {
          // Keep the active role the user picked; only refresh profile data.
          useAuthStore.setState({ user: freshUser });
        })
        .catch(() => {
          // 401 is handled by the interceptor; network errors keep the session.
        });
    }

    return unsubscribe;
  }, []);
}
