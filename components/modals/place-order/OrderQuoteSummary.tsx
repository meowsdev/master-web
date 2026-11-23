import { PriceQuote } from '@/types/order-placement.types';
import { formatTaka } from './format-taka';

/* The price lines and total the backend worked out, shown above the confirm button. */
export function OrderQuoteSummary({ quote }: { quote: PriceQuote }) {
  return (
    <div className="mt-[20px] rounded-[12px] border border-line bg-surface p-[14px]">
      {quote.lines.map((line) => (
        <div key={line.label} className="flex justify-between text-[13px] font-medium text-muted">
          <span>{line.count > 1 ? `${line.label} × ${line.count}` : line.label}</span>
          <span>{formatTaka(line.amount)}</span>
        </div>
      ))}
      <div className="mt-[8px] flex justify-between border-t border-line pt-[8px] text-[15px] font-semibold text-ink">
        <span>Total</span>
        <span>{formatTaka(quote.total)}</span>
      </div>
    </div>
  );
}
