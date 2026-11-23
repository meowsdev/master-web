'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { ScheduleSection } from '@/components/modals/place-order/ScheduleSection';
import { OrderQuoteSummary } from '@/components/modals/place-order/OrderQuoteSummary';
import { FormPart } from '@/components/modals/place-order/FormPart';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { fieldControlClass } from '@/components/modals/place-order/OrderField';
import { orderErrorMessage, useOrderPlaceFields } from '@/hooks/useOrderPlaceFields';
import { catalogService } from '@/services/catalog.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { cartLineAmount, useCartStore } from '@/store/useCartStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { customerMissing, OrderCustomer, OrderForCustomerSection } from './OrderForCustomerSection';
import { Order } from '@/types/order.types';

interface CartCheckoutPanelProps {
  mainServiceId: string;
  onClose: () => void;
  onPlaced: (order: Order) => void;
}

const MAX_QUANTITY = { FIXED: 1, PER_UNIT: 10, PER_SQFT: 10_000 } as const;

/*
 * Right-hand checkout of one main service's cart: the options (quantity / remove), what to tell the provider,
 * where and when, and the price the backend works out. One cart = one order = one new tab in the chat.
 * Staff who may create orders first say whom it is for (phone and name); it is then placed for that customer.
 */
export function CartCheckoutPanel({ mainServiceId, onClose, onPlaced }: CartCheckoutPanelProps) {
  const lines = useCartStore((state) => state.carts[mainServiceId]) ?? [];
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const setUser = useAuthStore((state) => state.setUser);
  const staffId = useAuthStore((state) => state.user?.id);
  const { canCreateOrders: isForCustomer } = useStaffPermissions();
  const selectOrder = useOrderHistoryStore((state) => state.select);
  const queryClient = useQueryClient();
  const [customer, setCustomer] = useState<OrderCustomer>({ phone: '', name: '', lookup: null });
  // The day and time picked with Tap to Schedule come in already filled.
  const place = useOrderPlaceFields(useScheduleStore.getState().schedules[mainServiceId], { forSomeoneElse: isForCustomer });
  const missing = [...(isForCustomer ? customerMissing(customer) : []), ...place.missingFields];
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useMemo(() => lines.map((line) => ({ variantId: line.variantId, quantity: line.priceUnit === 'FIXED' ? 1 : line.quantity })), [lines]);
  const { data: quote, error: quoteError } = useQuery({
    queryKey: ['cart-quote', mainServiceId, items],
    queryFn: () => catalogService.quoteCart({ categoryId: mainServiceId, items }),
    enabled: items.length > 0,
    retry: false,
    staleTime: 15_000,
  });

  const submit = async () => {
    if (!place.values || items.length === 0 || missing.length > 0) return;
    setIsSubmitting(true);
    try {
      const cart = { ...place.values, categoryId: mainServiceId, items, description: description.trim() || undefined };
      if (isForCustomer) {
        const { order } = await catalogService.placeCartForCustomer({ ...cart, customerPhone: customer.phone, customerName: customer.name.trim() });
        clear(mainServiceId);
        // Like the staff New order form: the order opens in the staff order list.
        if (staffId) {
          void queryClient.invalidateQueries({ queryKey: ['admin-orders', staffId] });
          selectOrder(staffId, order.id);
        }
        toast.success(`Order #${order.referenceCode} created for ${customer.name.trim()}`);
        onClose();
        return;
      }
      const { order } = await catalogService.placeCart(cart);
      clear(mainServiceId);
      // The backend kept this place on the profile; reloading the account lets the next form open with it.
      authService.getMe().then(setUser).catch(() => undefined);
      onPlaced(order);
    } catch (error) {
      toast.error(orderErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidePanelShell title="Confirm Order" onClose={onClose}>
      {lines.length === 0 ? (
        <p className="py-[40px] text-center text-[14px] text-muted">কার্ট খালি। সার্ভিস কার্ড থেকে অপশন Add করুন।</p>
      ) : (
        <div className="pb-[24px]">
          {isForCustomer && <OrderForCustomerSection customer={customer} onChange={setCustomer} place={place.state} />}
          <FormPart step={1} title="সার্ভিস" hint={`${lines.length}টি আইটেম`} isDone>
            <ul className="mt-[8px] flex flex-col divide-y divide-line rounded-[12px] border border-line">
              {lines.map((line) => {
                const isCountable = line.priceUnit !== 'FIXED';
                return (
                  <li key={line.variantId} className="flex items-center gap-[10px] px-[12px] py-[10px]">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">{line.subServiceName}</p>
                      <p className="text-[12px] text-muted">
                        {line.variantName} · {formatTaka(line.unitPrice)}
                        {isCountable ? ' / per' : ''}
                      </p>
                    </div>
                    {isCountable && (
                      <div className="flex items-center gap-[2px] rounded-full border border-line px-[4px] py-[2px]">
                        <button type="button" aria-label="Fewer" onClick={() => setQuantity(mainServiceId, line.variantId, line.quantity - 1)} className="flex size-[22px] cursor-pointer items-center justify-center rounded-full hover:bg-surface">
                          <HugeiconsIcon icon={MinusSignIcon} size={13} />
                        </button>
                        <span className="min-w-[18px] text-center text-[13px] font-semibold">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="More"
                          onClick={() => setQuantity(mainServiceId, line.variantId, Math.min(MAX_QUANTITY[line.priceUnit], line.quantity + 1))}
                          className="flex size-[22px] cursor-pointer items-center justify-center rounded-full hover:bg-surface"
                        >
                          <HugeiconsIcon icon={PlusSignIcon} size={13} />
                        </button>
                      </div>
                    )}
                    <span className="w-[72px] text-right text-[14px] font-semibold text-ink">{formatTaka(cartLineAmount(line))}</span>
                    <button type="button" aria-label={`Remove ${line.subServiceName}`} onClick={() => remove(mainServiceId, line.variantId)} className="cursor-pointer rounded-full p-[4px] text-[#d64545] hover:bg-[#fdecec]">
                      <HugeiconsIcon icon={Delete02Icon} size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="প্রোভাইডারকে কিছু জানাতে চাইলে লিখুন (ঐচ্ছিক)"
              className={`${fieldControlClass} mt-[12px] w-full resize-none rounded-[8px] border border-line p-[10px]`}
            />
          </FormPart>

          <ScheduleSection state={place.state} />

          {quote && <OrderQuoteSummary quote={quote} />}
          {quoteError && <p className="mt-[12px] text-[13px] font-medium text-[#d64545]">{orderErrorMessage(quoteError, 'দাম হিসাব করা যায়নি')}</p>}

          <div className="mt-[28px] flex justify-center">
            <button
              type="button"
              onClick={submit}
              disabled={!place.values || !quote || isSubmitting || missing.length > 0}
              className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
            >
              {isSubmitting ? 'Placing order...' : 'Confirm & Chat'}
            </button>
          </div>
          {missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-muted">বাকি আছে: {missing.join(', ')}</p>}
        </div>
      )}
    </SidePanelShell>
  );
}
