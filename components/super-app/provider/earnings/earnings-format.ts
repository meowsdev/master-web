import { ProviderLevel } from '@/types/provider-earnings.types';

export const LEVEL_LABEL: Record<ProviderLevel, string> = {
  LEVEL_0: 'লেভেল ০',
  LEVEL_1: 'লেভেল ১',
  LEVEL_2: 'লেভেল ২',
  TOP_RATED: 'টপ রেটেড',
};

/** Days the success score and response rate look back (REVIEW_WINDOW_DAYS in the backend's level-rules.ts). */
export const LEVEL_REVIEW_WINDOW_DAYS = 60;

/** Bengali digits, e.g. 4.5 → "৪.৫". */
export const bnNumber = (value: number, maximumFractionDigits = 0) => value.toLocaleString('bn-BD', { maximumFractionDigits });

/** "YYYY-MM" → "নভেম্বর ২০২৬". */
export const bnMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
};

/** "২৪ নভেম্বর, ২০২৬". */
export const bnDate = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
