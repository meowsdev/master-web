'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';

interface CountStepperProps {
  value: number;
  max: number;
  onChange: (count: number) => void;
  label: string;
}

/* The "↑ 1 ∨" count picker beside a row. It only exists when an admin marked that row countable. */
export function CountStepper({ value, max, onChange, label }: CountStepperProps) {
  return (
    <label className="flex shrink-0 items-center gap-[4px] border-b border-ink/60 pb-[8px] pt-[22px]" title={label}>
      <HugeiconsIcon icon={ArrowUp01Icon} size={16} className="text-ink" />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="cursor-pointer appearance-none bg-transparent px-[4px] text-[14px] font-semibold text-ink outline-none"
      >
        {Array.from({ length: max }, (_, index) => index + 1).map((count) => (
          <option key={count} value={count}>
            {count.toLocaleString('bn-BD')}
          </option>
        ))}
      </select>
      <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="text-ink" />
    </label>
  );
}
