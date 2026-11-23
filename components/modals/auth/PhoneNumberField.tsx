'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import PhoneInput, { type Country } from 'react-phone-number-input/mobile';
import englishCountryNames from 'react-phone-number-input/locale/en.json';
import { CountryCodeDropdown } from './CountryCodeDropdown';

interface PhoneNumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  trailing?: ReactNode;
}

// The library renders whatever component we give it and hands it the input props plus a ref.
const PhoneNumberInput = forwardRef<HTMLInputElement, PhoneNumberInputProps>(function PhoneNumberInput(
  { trailing, ...inputProps },
  ref,
) {
  return (
    <div className="flex flex-1 items-center justify-between gap-[8px] border-b border-line pb-[8px] transition-colors focus-within:border-primary">
      <input
        {...inputProps}
        ref={ref}
        className="w-full bg-transparent text-[18px] tracking-[-0.36px] text-ink outline-none placeholder:text-muted"
      />
      {trailing}
    </div>
  );
});

interface PhoneNumberFieldProps {
  /** Full international number (E.164, e.g. +8801711223344) or '' while empty/incomplete. */
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  trailing?: ReactNode;
}

/*
 * Country-code dropdown + number input (react-phone-number-input, mobile rules).
 * Bangladesh is the default and listed first. The value handed up is always the
 * full +<country><number> form, which is what the OTP endpoints expect.
 */
export function PhoneNumberField({ value, onChange, readOnly, trailing }: PhoneNumberFieldProps) {
  const [country, setCountry] = useState<Country | undefined>('BD');

  return (
    <PhoneInput
      defaultCountry="BD"
      countryCallingCodeEditable={false}
      labels={englishCountryNames}
      countryOptionsOrder={['BD', '|', '...']}
      value={value || undefined}
      onChange={(next) => onChange(next ?? '')}
      onCountryChange={setCountry}
      readOnly={readOnly}
      placeholder={country === 'BD' ? '017XXXXXXXX' : 'Phone number'}
      countrySelectComponent={CountryCodeDropdown}
      inputComponent={PhoneNumberInput}
      numberInputProps={{ trailing }}
      className="flex w-full items-center gap-[21px]"
    />
  );
}
