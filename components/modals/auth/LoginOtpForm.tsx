'use client';

import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { PhoneNumberField } from './PhoneNumberField';
import { OtpControls, OtpVerifyRow } from './OtpVerifyRow';

interface LoginOtpFormProps {
  phone: string;
  onPhoneChange: (value: string) => void;
  otp: OtpControls;
  onTechnicianLogin: () => void;
}

/*
 * Step 1 of sign-in: only a phone number and its OTP. Whether the number then
 * logs straight in or continues to profile setup is decided by the server's
 * answer to Verify, so this form knows nothing about registration.
 */
export function LoginOtpForm({ phone, onPhoneChange, otp }: LoginOtpFormProps) {
  const isPhoneValid = phone !== '' && isValidPhoneNumber(phone);

  return (
    <div className="flex w-full flex-col items-center gap-[48px]">
      <PhoneNumberField value={phone} onChange={onPhoneChange} />
      <OtpVerifyRow otp={otp} isPhoneValid={isPhoneValid} />

    </div>
  );
}
