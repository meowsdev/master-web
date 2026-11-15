import { authService } from '@/services/auth.service';
import { endLocalSession } from '@/lib/auth-session';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * The only intentional way a session ends. The local wipe runs even if the
 * server call fails (offline), so the user is never stuck "half logged in".
 */
export async function logoutUser(): Promise<void> {
  const legacyRefreshToken = useAuthStore.getState().refreshToken ?? undefined;
  try {
    await authService.logout(legacyRefreshToken);
  } catch {
    // The server session may linger until its token expires or is revoked.
  } finally {
    endLocalSession({ broadcast: true, redirect: true });
  }
}
