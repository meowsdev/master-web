'use client';

import { useState } from 'react';
import { OTP_LENGTH } from '@/lib/otp-errors';

interface OtpCodeBoxesProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  /** Called when Enter is pressed, so the code can be submitted from the keyboard. */
  onEnter?: () => void;
}

/*
 * Figma's separate 48px digit boxes, driven by ONE invisible input stretched
 * over them. That keeps paste, autofill and the existing single `otp` string
 * working unchanged instead of juggling six inputs.
 */
export function OtpCodeBoxes({ value, onChange, length = OTP_LENGTH, disabled = false, onEnter }: OtpCodeBoxesProps) {
  const [isFocused, setIsFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div className={`relative flex items-center gap-[8px] ${disabled ? 'opacity-50' : ''}`}>
      {Array.from({ length }, (_, index) => (
        <div
          key={index}
          className={`flex size-[36px] items-center sm:size-[42px] justify-center rounded-[4px] border text-[20px] font-semibold text-ink ${
            isFocused && index === activeIndex ? 'border-primary' : 'border-ink'
          }`}
        >
          {value[index] ?? ''}
        </div>
      ))}
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Verification code"
        maxLength={length}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault(); // Enter must not submit the whole account form
          onEnter?.();
        }}
        disabled={disabled}
        className="absolute inset-0 size-full cursor-text opacity-0"
      />
    </div>
  );
}
