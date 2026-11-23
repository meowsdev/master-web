import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SelectOption {
  id: number;
  label: string;
}

interface LocationSelectProps {
  icon: LucideIcon;
  placeholder: string;
  options: SelectOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
}

/* Native <select> dressed as the Figma underlined dropdown (keeps keyboard + mobile pickers). */
export function LocationSelect({ icon: Icon, placeholder, options, value, onChange, disabled }: LocationSelectProps) {
  return (
    <div className="flex w-full items-center gap-[12px]">
      <Icon className="size-[24px] shrink-0 text-ink" strokeWidth={1.5} />
      <div className="relative flex-1 border-b border-line pb-[8px] transition-colors focus-within:border-primary">
        <select
          value={value ?? ''}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
          className={`w-full cursor-pointer appearance-none bg-transparent pr-[32px] text-[18px] tracking-[-0.36px] outline-none disabled:cursor-not-allowed ${
            value === null ? 'text-muted' : 'text-ink'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-[2px] size-[24px] text-ink" strokeWidth={1.5} />
      </div>
    </div>
  );
}
