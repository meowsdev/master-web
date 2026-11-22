'use client';

import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useOrderQuotes } from '@/hooks/useOrderQuotes';
import { Order } from '@/types/order.types';
import { OrderQuote } from '@/types/catalog.types';

const STATUS_LABEL: Record<OrderQuote['status'], string> = {
  PENDING: 'আপনার উত্তরের অপেক্ষায়',
  ACCEPTED: 'Accept করা হয়েছে',
  REJECTED: 'Reject করা হয়েছে',
  REPLACED: 'নতুন দাম দিয়ে বদলানো হয়েছে',
};

/*
 * A custom order's price, in the chat: what the provider wants after the visit, item by item, with Accept / Reject
 * for the customer. Before any price arrives it says the visit is free and the price will come here.
 */
export function QuoteCard({ order, userId, viewer }: { order: Order; userId: string; viewer: 'CUSTOMER' | 'PROVIDER' }) {
  const { quotes, accept, reject, isAnswering } = useOrderQuotes(order, userId);
  if (!order.isPricePending && quotes.length === 0) return null;

  return (
    <div className="flex flex-col gap-[10px]">
      {order.isPricePending && quotes.every((quote) => quote.status !== 'PENDING') && (
        <div className="self-center rounded-[12px] border border-amber-200 bg-amber-50 px-[14px] py-[10px] text-center text-[13px] text-amber-800">
          {viewer === 'CUSTOMER'
            ? 'Custom অর্ডার: প্রোভাইডার ভিজিট করে এখানে দাম পাঠাবে। ভিজিট ফ্রি।'
            : 'Custom অর্ডার: ভিজিটের পর + মেনু থেকে "দাম পাঠান" দিয়ে কাস্টমারকে দাম জানান।'}
        </div>
      )}
      {quotes.map((quote) => {
        const isOpen = quote.status === 'PENDING';
        return (
          <div key={quote.id} className={`w-full max-w-[420px] self-center rounded-[16px] border bg-white p-[14px] ${isOpen ? 'border-[#1daa61]' : 'border-[#e5e5e5] opacity-80'}`}>
            <div className="mb-[8px] flex items-center justify-between gap-[8px]">
              <p className="text-[15px] font-semibold text-[#202939]">প্রোভাইডারের দাম</p>
              <span className={`rounded-full px-[8px] py-[2px] text-[11px] font-semibold ${isOpen ? 'bg-amber-100 text-amber-800' : quote.status === 'ACCEPTED' ? 'bg-[#e7fce3] text-[#15803d]' : 'bg-[#f0f0f0] text-[#697586]'}`}>
                {viewer === 'PROVIDER' && isOpen ? 'কাস্টমারের উত্তরের অপেক্ষায়' : STATUS_LABEL[quote.status]}
              </span>
            </div>
            {quote.items.map((item, index) => (
              <div key={`${index}-${item.label}`} className="flex justify-between text-[13px] text-[#364152]">
                <span>{item.label}</span>
                <span>{formatTaka(item.amount)}</span>
              </div>
            ))}
            <div className="mt-[8px] flex justify-between border-t border-[#e5e5e5] pt-[8px] text-[15px] font-semibold text-[#202939]">
              <span>Total</span>
              <span>{formatTaka(quote.totalAmount)}</span>
            </div>
            {quote.note && <p className="mt-[8px] text-[13px] text-[#697586]">“{quote.note}”</p>}
            {viewer === 'CUSTOMER' && isOpen && (
              <div className="mt-[12px] flex gap-[8px]">
                <button type="button" disabled={isAnswering} onClick={() => reject.mutate(quote.id)} className="flex-1 cursor-pointer rounded-[8px] border border-[#d64545] py-[8px] text-[14px] font-semibold text-[#d64545] hover:bg-[#fdecec] disabled:opacity-50">
                  Reject
                </button>
                <button type="button" disabled={isAnswering} onClick={() => accept.mutate(quote.id)} className="flex-1 cursor-pointer rounded-[8px] bg-[#1daa61] py-[8px] text-[14px] font-semibold text-white hover:bg-[#189452] disabled:opacity-50">
                  Accept
                </button>
              </div>
            )}
            {viewer === 'CUSTOMER' && isOpen && <p className="mt-[6px] text-center text-[11px] text-[#697586]">Reject করলে অর্ডার বাতিল হবে, কোনো চার্জ নেই।</p>}
          </div>
        );
      })}
    </div>
  );
}
