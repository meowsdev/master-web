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
    <div className="text-center text-xs">
      <button
        type="button"
        // Disabled while sending too, so a double click can't fire two requests.
        disabled={isCoolingDown || isSending}
        onClick={onResend}
        className="font-semibold text-[#008069] dark:text-[#25D366] hover:underline disabled:cursor-not-allowed disabled:text-[#8696a0] disabled:no-underline cursor-pointer"
      >
        {isSending ? 'Sending...' : 'Resend OTP'}
      </button>
      {isCoolingDown && (
        <span className="ml-1 text-[#667781] dark:text-[#8696a0]" aria-live="polite">
          in <strong className="font-mono">{formatCountdown(secondsLeft)}</strong>
        </span>
      )}
    </div>
  );
}
