'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Phone, Search } from 'lucide-react';
import { getCountryCallingCode, type Country } from 'react-phone-number-input/mobile';

interface CountryOption {
  value?: string;
  label: string;
  divider?: boolean;
}

interface CountryCodeDropdownProps {
  value?: string;
  onChange: (country?: Country) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
}

const dialCodeOf = (country?: string): string => {
  if (!country) return '';
  try {
    return `+${getCountryCallingCode(country as Country)}`;
  } catch {
    return '';
  }
};

/*
 * Replaces the library's native <select> (react-phone-number-input's
 * `countrySelectComponent` hook) with the Figma "BD +880 ⌄" trigger and a
 * searchable list, since there are ~240 countries to pick from.
 */
export function CountryCodeDropdown({ value, onChange, options, disabled, readOnly }: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const isLocked = Boolean(disabled || readOnly);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  // "International" (no country) and dividers make no sense in this list.
  const countries = useMemo(
    () => options.filter((option) => option.value && !option.divider),
    [options],
  );

  const visibleCountries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return countries;
    return countries.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.value!.toLowerCase().includes(needle) ||
        dialCodeOf(option.value).includes(needle),
    );
  }, [countries, query]);

  const selectCountry = (country: string) => {
    onChange(country as Country);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative flex w-[160px] shrink-0 items-center gap-[12px]">
      <Phone className="size-[24px] shrink-0 text-ink" strokeWidth={1.5} />
      <button
        type="button"
        disabled={isLocked}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Country code"
        onClick={() => setIsOpen((open) => !open)}
        className="flex flex-1 cursor-pointer items-center justify-between gap-[4px] whitespace-nowrap border-b border-line pb-[8px] text-[18px] tracking-[-0.36px] text-muted transition-colors focus-visible:border-primary disabled:cursor-default"
      >
        <span>
          {value} {dialCodeOf(value)}
        </span>
        {!isLocked && <ChevronDown className="size-[24px] shrink-0 text-ink" strokeWidth={1.5} />}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-[8px] w-[300px] overflow-hidden rounded-[12px] border border-line bg-white shadow-xl">
          <label className="flex items-center gap-[8px] border-b border-line px-[12px] py-[10px]">
            <Search className="size-[16px] shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or code"
              className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
            />
          </label>
          <ul role="listbox" className="max-h-[260px] overflow-y-auto py-[4px]">
            {visibleCountries.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => selectCountry(option.value!)}
                    className={`flex w-full cursor-pointer items-center gap-[8px] px-[12px] py-[8px] text-left text-[14px] hover:bg-surface ${
                      isSelected ? 'bg-secondary text-ink' : 'text-ink'
                    }`}
                  >
                    <span className="w-[28px] shrink-0 font-semibold text-muted">{option.value}</span>
                    <span className="flex-1 truncate">{option.label}</span>
                    <span className="shrink-0 text-muted">{dialCodeOf(option.value)}</span>
                    {isSelected && <Check className="size-[14px] shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
            {visibleCountries.length === 0 && (
              <li className="px-[12px] py-[12px] text-[14px] text-muted">No country found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
