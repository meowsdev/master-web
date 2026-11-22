'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { orderErrorMessage } from '@/hooks/useOrderPlaceFields';
import { catalogService } from '@/services/catalog.service';
import { Order } from '@/types/order.types';
import { AmountRow, AmountRowsEditor, EMPTY_AMOUNT_ROW, sumAmountRows, toAmountItems } from '../../order-chat/AmountRowsEditor';

/*
 * The provider's price for a custom order, after the site visit. Nothing is charged here: the customer accepts it
 * (it becomes the order's price) or rejects it (the order is cancelled). A new price replaces an unanswered one.
 */
export function SendQuotePanel({ order, userId, onClose }: { order: Order; userId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<AmountRow[]>([EMPTY_AMOUNT_ROW]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = sumAmountRows(rows);

  const submit = async () => {
    const items = toAmountItems(rows);
    if (items.some((item) => item.label.length < 2 || !(item.amount > 0))) {
      toast.error('প্রতিটি কাজের নাম ও সঠিক দাম দিন।');
      return;
    }
    setIsSubmitting(true);
    try {
      await catalogService.sendQuote(order.id, { items, note: note.trim() || undefined });
      toast.success('দাম কাস্টমারের কাছে পাঠানো হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['order-quotes', userId, order.id] });
      onClose();
    } catch (error) {
      toast.error(orderErrorMessage(error, 'Could not send the price'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidePanelShell title="দাম পাঠান" onClose={onClose}>
      <p className="text-[13px] font-medium text-[#697586]">Custom অর্ডার: সাইট দেখে কাজের দাম লিখুন। কাস্টমার Accept করলে এটাই অর্ডারের দাম হবে।</p>
      {order.bookingDetail?.description && (
        <div className="mt-[12px] rounded-[12px] bg-[#f7f5f3] p-[12px] text-[13px] text-[#364152]">
          <p className="mb-[4px] font-semibold text-[#202939]">কাস্টমারের সমস্যা</p>
          {order.bookingDetail.description}
        </div>
      )}

      <AmountRowsEditor rows={rows} onChange={setRows} labelPlaceholder="যেমন: কম্প্রেসর মেরামত" addLabel="আরেকটি কাজ যোগ করুন" />

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        rows={2}
        placeholder="কাস্টমারকে ছোট নোট (ঐচ্ছিক)"
        className="mt-[16px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[10px] text-[14px] outline-none focus:border-[#1daa61]"
      />

      <div className="mt-[16px] flex justify-between rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px] text-[15px] font-semibold text-[#202939]">
        <span>মোট দাম</span>
        <span>{formatTaka(total)}</span>
      </div>

      <div className="mt-[28px] flex justify-center">
        <button type="button" onClick={submit} disabled={isSubmitting} className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? 'পাঠানো হচ্ছে...' : 'কাস্টমারের কাছে পাঠান'}
        </button>
      </div>
    </SidePanelShell>
  );
}
