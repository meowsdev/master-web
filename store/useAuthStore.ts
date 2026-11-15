import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  activeRole: UserRole | null;
  /**
   * A number that passed OTP but has not finished sign-up (no name/username yet).
   * The app still treats the visitor as a guest until they Save; this also lets
   * the sign-up panel come back after a page reload.
   */
  pendingRegistrationUser: User | null;
  setPendingRegistration: (user: User | null) => void;
  /** OTP sessions pass no tokens: they live in httpOnly cookies, out of JS reach. */
  setAuth: (user: User, accessToken?: string, refreshToken?: string) => void;
  /** Legacy (technician) sessions still keep their tokens client-side. */
  setLegacyTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeRole: null,
      pendingRegistrationUser: null,

      setPendingRegistration: (pendingRegistrationUser) => set({ pendingRegistrationUser }),

      setAuth: (user, accessToken, refreshToken) =>
        set({
          pendingRegistrationUser: null,
          user,
          accessToken: accessToken ?? null,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
          activeRole: user.role,
        }),

      setLegacyTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user, activeRole: user.role }),

      setRole: (role) => set({ activeRole: role }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          activeRole: null,
          pendingRegistrationUser: null,
        }),
    }),
    {
      name: 'master_auth_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
