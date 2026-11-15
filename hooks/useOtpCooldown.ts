'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'master_otp_resend_';

function readDeadline(storageKey: string | null): number | null {
  if (!storageKey) return null;
  try {
    const stored = Number(sessionStorage.getItem(storageKey));
    return stored > Date.now() ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Live resend countdown for one phone number.
 *
 * The deadline comes from the server (`retryAfterSeconds`, i.e. nextAllowedAt
 * minus server "now") and is stored as an absolute local timestamp, so it is
 * immune to a wrong device clock. It survives a page refresh via
 * sessionStorage, and is recomputed from the clock on tab focus because
 * background tabs throttle timers.
 */
export function useOtpCooldown(phoneNumber: string) {
  const storageKey = phoneNumber ? `${STORAGE_PREFIX}${phoneNumber}` : null;

  // Keyed by phone so switching numbers never shows another number's countdown.
  const [deadlineByKey, setDeadlineByKey] = useState<Record<string, number | null>>({});
  const [now, setNow] = useState(() => Date.now());

  const deadline = storageKey
    ? (deadlineByKey[storageKey] ?? readDeadline(storageKey))
    : null;
  const secondsLeft =
    deadline && deadline > now ? Math.ceil((deadline - now) / 1000) : 0;
  const isCoolingDown = secondsLeft > 0;

  useEffect(() => {
    if (!isCoolingDown) return;
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [isCoolingDown]);

  /** Start or resync from a server answer (send success or 429). */
  const startCooldown = useCallback(
    (retryAfterSeconds: number) => {
      if (!storageKey) return;
      const nextDeadline = Date.now() + retryAfterSeconds * 1000;
      try {
        sessionStorage.setItem(storageKey, String(nextDeadline));
      } catch {
        // sessionStorage unavailable: the countdown still works in memory
      }
      setNow(Date.now());
      setDeadlineByKey((previous) => ({ ...previous, [storageKey]: nextDeadline }));
    },
    [storageKey],
  );

  return { secondsLeft, isCoolingDown, startCooldown };
}
