'use client';

import { ReactNode } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

/**
 * One row of the Figma order form: a leading icon and the control. The underline belongs to the control
 * only, so it starts after the icon and never runs beneath it.
 */
export function OrderField({ icon, children }: { icon: IconSvgElement; children: ReactNode }) {
  return (
    <div className="flex items-start gap-[12px] pt-[22px]">
      <span className="flex h-[22px] shrink-0 items-center">
        <HugeiconsIcon icon={icon} size={20} className="text-ink" />
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-[12px] border-b border-ink/60 pb-[8px]">{children}</div>
    </div>
  );
}

export const fieldControlClass =
  'min-w-0 flex-1 bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-muted disabled:text-muted';

interface SelectOption {
  value: string | number;
  label: string;
}

interface OrderSelectProps {
  icon: IconSvgElement;
  placeholder: string;
  value: string | number | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Native select (keeps keyboard and mobile pickers) dressed as the Figma dropdown. */
export function OrderSelect({ icon, placeholder, value, options, onChange, disabled }: OrderSelectProps) {
  return (
    <OrderField icon={icon}>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldControlClass} cursor-pointer appearance-none`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <HugeiconsIcon icon={ArrowDown01Icon} size={18} className="pointer-events-none shrink-0 text-ink" />
    </OrderField>
  );
}
