'use client';

import { formatCountdown, OTP_LENGTH } from '@/lib/otp-errors';
import { OtpCodeBoxes } from './OtpCodeBoxes';

/** Everything the OTP row needs. */
export interface OtpControls {
  value: string;
  onChange: (value: string) => void;
  /** Boxes accept input only after a code was sent to this number. */
  canEnter: boolean;
  isSending: boolean;
  isVerifying: boolean;
  secondsLeft: number;
  onSend: () => void;
  /** Runs only when the user presses Verify (or Enter); typing the code never submits it. */
  onVerify: () => void;
  serverCode: string | null;
  onUseServerCode: () => void;
}

interface OtpVerifyRowProps {
  otp: OtpControls;
  /** The phone number is valid enough to request a code for it. */
  isPhoneValid: boolean;
}

const primaryButtonClass =
  'cursor-pointer whitespace-nowrap rounded-[12px] bg-[#1daa61] px-[16px] py-[8px] text-[20px] font-semibold tracking-[-0.4px] text-white transition-opacity hover:bg-[#189452] disabled:cursor-not-allowed disabled:bg-[#1daa61]/50';

/* Six code boxes, countdown and the Send OTP -> Verify button of the Figma login panel. */
export function OtpVerifyRow({ otp, isPhoneValid }: OtpVerifyRowProps) {
  const isCodeSent = otp.canEnter;
  const canSendOtp = isPhoneValid && !otp.isSending && otp.secondsLeft === 0;
  const canVerify = otp.value.length === OTP_LENGTH && !otp.isVerifying;

  return (
    <div className="w-full space-y-[12px]">
      {/* On a phone the timer + button no longer fit beside six boxes, so they wrap below. */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-[12px] gap-y-[12px]">
        <OtpCodeBoxes
          value={otp.value}
          onChange={otp.onChange}
          disabled={!otp.canEnter}
          onEnter={() => canVerify && otp.onVerify()}
        />
        <div className="ml-auto flex items-center gap-[12px]">
          <span className="text-[18px] tracking-[-0.36px] text-[#697586]" aria-live="polite">
            {formatCountdown(otp.secondsLeft).replace(':', '.')}
          </span>
          {isCodeSent ? (
            <button type="button" onClick={otp.onVerify} disabled={!canVerify} className={primaryButtonClass}>
              {otp.isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          ) : (
            <button type="button" onClick={otp.onSend} disabled={!canSendOtp} className={primaryButtonClass}>
              {otp.isSending ? 'Sending...' : 'Send OTP'}
            </button>
          )}
        </div>
      </div>

      {isCodeSent && (
        <button
          type="button"
          onClick={otp.onSend}
          disabled={!canSendOtp}
          className="cursor-pointer text-[14px] font-semibold text-[#1daa61] hover:underline disabled:cursor-not-allowed disabled:text-[#697586] disabled:no-underline"
        >
          {otp.isSending ? 'Sending...' : 'Resend OTP'}
          {otp.secondsLeft > 0 && ` in ${formatCountdown(otp.secondsLeft)}`}
        </button>
      )}

      {otp.serverCode && (
        <div
          onClick={otp.onUseServerCode}
          className="flex w-full cursor-pointer items-center justify-between rounded-[12px] border border-[#bccdba] bg-[#d7fdd2] p-[10px] text-[14px] font-medium text-[#205737]"
          title="Click to auto-fill"
        >
          <span>
            Backend Code: <strong>{otp.serverCode}</strong>
          </span>
          <span className="text-[12px] underline">Auto-fill</span>
        </div>
      )}
    </div>
  );
}
