export type OtpErrorKind =
  | 'COOLDOWN'
  | 'DAILY_LIMIT'
  | 'IP_LIMIT'
  | 'OTP_EXPIRED'
  | 'OTP_INVALID'
  | 'OTP_TOO_MANY_ATTEMPTS'
  | 'UNKNOWN';

export interface ParsedOtpError {
  kind: OtpErrorKind;
  message: string;
  /** Present on 429 responses: when the next send is allowed. */
  retryAfterSeconds?: number;
  nextAllowedAt?: string;
}

interface ErrorBody {
  message?: string | string[];
  code?: string;
  reason?: string;
  retryAfterSeconds?: number;
  nextAllowedAt?: string;
  attemptsLeft?: number;
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** Turns a backend OTP error into a kind plus a user-facing message. */
export function parseOtpError(error: unknown): ParsedOtpError {
  const body = (error as { response?: { data?: ErrorBody } })?.response?.data;
  const fallback = Array.isArray(body?.message) ? body?.message[0] : body?.message;

  if (body?.reason === 'COOLDOWN' && body.retryAfterSeconds !== undefined) {
    return {
      kind: 'COOLDOWN',
      message: `Please wait ${formatCountdown(body.retryAfterSeconds)} before requesting a new OTP.`,
      retryAfterSeconds: body.retryAfterSeconds,
      nextAllowedAt: body.nextAllowedAt,
    };
  }
  if (body?.reason === 'DAILY_LIMIT') {
    return {
      kind: 'DAILY_LIMIT',
      message: 'You have reached the daily OTP limit for this number. Please try again tomorrow.',
      retryAfterSeconds: body.retryAfterSeconds,
      nextAllowedAt: body.nextAllowedAt,
    };
  }
  if (body?.reason === 'IP_LIMIT') {
    return {
      kind: 'IP_LIMIT',
      message: 'Too many OTP requests from this network. Please try again later.',
      retryAfterSeconds: body.retryAfterSeconds,
      nextAllowedAt: body.nextAllowedAt,
    };
  }
  if (body?.code === 'OTP_TOO_MANY_ATTEMPTS') {
    return {
      kind: 'OTP_TOO_MANY_ATTEMPTS',
      message: 'Too many wrong attempts. This code is no longer valid, please request a new OTP.',
    };
  }
  if (body?.code === 'OTP_EXPIRED') {
    return {
      kind: 'OTP_EXPIRED',
      message: 'This code has expired. Please request a new OTP.',
    };
  }
  if (body?.code === 'OTP_INVALID') {
    const left = body.attemptsLeft;
    return {
      kind: 'OTP_INVALID',
      message:
        left !== undefined
          ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
          : 'Incorrect code.',
    };
  }
  return { kind: 'UNKNOWN', message: fallback || 'Something went wrong. Please try again.' };
}
