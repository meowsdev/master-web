'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon, Note01Icon } from '@hugeicons/core-free-icons';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';

/** One "what + how much" line while it is being typed. */
export interface AmountRow {
  label: string;
  amount: string;
}

export const EMPTY_AMOUNT_ROW: AmountRow = { label: '', amount: '' };

/** Typed rows as numbers, labels trimmed. */
export const toAmountItems = (rows: AmountRow[]) => rows.map((row) => ({ label: row.label.trim(), amount: parseFloat(row.amount) || 0 }));

/** Saved items back into editable rows. */
export const toAmountRows = (items: Array<{ label: string; amount: number | string }>): AmountRow[] =>
  items.map((item) => ({ label: item.label, amount: String(Number(item.amount)) }));

export const sumAmountRows = (rows: AmountRow[]) => rows.reduce((sum, row) => sum + Math.max(0, parseFloat(row.amount) || 0), 0);

interface AmountRowsEditorProps {
  rows: AmountRow[];
  onChange: (rows: AmountRow[]) => void;
  labelPlaceholder: string;
  addLabel: string;
  maxRows?: number;
}

/* Editable "item + amount" lines with add / remove. Used for extra charges, job costs and the admin's cost review. */
export function AmountRowsEditor({ rows, onChange, labelPlaceholder, addLabel, maxRows = 10 }: AmountRowsEditorProps) {
  const updateRow = (index: number, changes: Partial<AmountRow>) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...changes } : row)));

  return (
    <>
      {rows.map((row, index) => (
        <OrderField key={index} icon={Note01Icon}>
          <input value={row.label} onChange={(event) => updateRow(index, { label: event.target.value })} maxLength={100} placeholder={labelPlaceholder} className={fieldControlClass} />
          <input
            inputMode="numeric"
            value={row.amount}
            onChange={(event) => updateRow(index, { amount: event.target.value.replace(/\D/g, '').slice(0, 7) })}
            placeholder="৳ পরিমাণ"
            aria-label="Amount"
            className={`${fieldControlClass} max-w-[110px] flex-none text-right`}
          />
          {rows.length > 1 && (
            <button type="button" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} aria-label="Remove" className="cursor-pointer text-[#d64545]">
              <HugeiconsIcon icon={Delete02Icon} size={18} />
            </button>
          )}
        </OrderField>
      ))}

      {rows.length < maxRows && (
        <button type="button" onClick={() => onChange([...rows, EMPTY_AMOUNT_ROW])} className="mt-[14px] flex cursor-pointer items-center gap-[6px] text-[14px] font-semibold text-[#1daa61]">
          <HugeiconsIcon icon={Add01Icon} size={16} /> {addLabel}
        </button>
      )}
    </>
  );
}
