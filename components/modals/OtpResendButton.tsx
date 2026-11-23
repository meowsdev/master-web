'use client';

import { formatCountdown } from '@/lib/otp-errors';

interface OtpResendButtonProps {
  secondsLeft: number;
  isSending: boolean;
  onResend: () => void;
}

export function OtpResendButton({ secondsLeft, isSending, onResend }: OtpResendButtonProps) {
  const isCoolingDown = secondsLeft > 0;

  return (
    <div className="text-center text-[14px]">
      <button
        type="button"
        // Disabled while sending too, so a double click can't fire two requests.
        disabled={isCoolingDown || isSending}
        onClick={onResend}
        className="font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline cursor-pointer"
      >
        {isSending ? 'Sending...' : 'Resend OTP'}
      </button>
      {isCoolingDown && (
        <span className="ml-1 text-muted" aria-live="polite">
          in <strong className="font-mono">{formatCountdown(secondsLeft)}</strong>
        </span>
      )}
    </div>
  );
}
