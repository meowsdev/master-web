import { InputHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

const underlineClass =
  'border-b border-line pb-[8px] transition-colors focus-within:border-primary';
const inputClass =
  'w-full bg-transparent text-[18px] tracking-[-0.36px] text-ink outline-none placeholder:text-muted';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  trailing?: ReactNode;
}

/* Icon + underlined input, the field style of the Figma sign-in panel. */
export function AuthField({ icon: Icon, trailing, ...inputProps }: AuthFieldProps) {
  return (
    <div className="flex w-full items-center gap-[12px]">
      <Icon className="size-[24px] shrink-0 text-ink" strokeWidth={1.5} />
      <div className={`flex flex-1 items-center justify-between gap-[8px] ${underlineClass}`}>
        <input {...inputProps} className={inputClass} />
        {trailing}
      </div>
    </div>
  );
}
