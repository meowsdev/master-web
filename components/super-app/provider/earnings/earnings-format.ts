import { ProviderLevel } from '@/types/provider-earnings.types';

export const LEVEL_LABEL: Record<ProviderLevel, string> = {
  NEW: 'নতুন',
  BRONZE: 'ব্রোঞ্জ',
  SILVER: 'সিলভার',
  GOLD: 'গোল্ড',
  PLATINUM: 'প্লাটিনাম',
};

/** Bengali digits, e.g. 4.5 → "৪.৫". */
export const bnNumber = (value: number, maximumFractionDigits = 0) => value.toLocaleString('bn-BD', { maximumFractionDigits });

/** "YYYY-MM" → "নভেম্বর ২০২৬". */
export const bnMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
};

/** "২৪ নভেম্বর, ২০২৬". */
export const bnDate = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
