'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

// Mirrors the backend rule; the server stays the authority and re-checks on save.
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const DEBOUNCE_MS = 400;

/** Live "is this username free?" status, debounced so typing doesn't spam the API. */
/**
 * `ownUsername` is the signed-in user's current handle (edit mode): keeping it
 * unchanged is fine, so it never hits the API (which would answer "taken").
 */
export function useUsernameAvailability(username: string, ownUsername?: string | null): UsernameStatus {
  const normalized = username.trim().toLowerCase();
  const [debounced, setDebounced] = useState(normalized);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(normalized), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [normalized]);

  const isValid = USERNAME_PATTERN.test(normalized);
  const query = useQuery({
    queryKey: ['username-available', debounced],
    queryFn: () => authService.checkUsername(debounced),
    enabled: USERNAME_PATTERN.test(debounced) && debounced !== ownUsername,
    staleTime: 15_000,
  });

  if (!normalized) return 'idle';
  if (!isValid) return 'invalid';
  if (normalized === ownUsername) return 'available';
  if (debounced !== normalized || query.isLoading) return 'checking';
  if (!query.data) return 'checking';
  return query.data.available ? 'available' : 'taken';
}
