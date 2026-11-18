'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { PhoneNumberField } from '@/components/modals/auth/PhoneNumberField';
import { OrderQuoteSummary } from '@/components/modals/place-order/OrderQuoteSummary';
import { ProblemSection } from '@/components/modals/place-order/ProblemSection';
import { ScheduleSection } from '@/components/modals/place-order/ScheduleSection';
import { ServiceAvatar } from '@/components/modals/place-order/ServiceAvatar';
import { usePlaceOrderForm } from '@/hooks/usePlaceOrderForm';
import { orderPlacementService } from '@/services/order-placement.service';
import { useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { Order } from '@/types/order.types';
import { UserIcon } from '@hugeicons/core-free-icons';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';

/*
 * "New order" for the admin: an order for a customer who did not order through the app. It is the same form
 * as the customer's Place Order panel (service, problem, quantity, location, date), plus the customer's phone
 * number. The backend prices it and matches providers by area exactly as for any order.
 */
export function AdminCreateOrderPanel({ adminId, onClose }: { adminId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const selectOrder = useOrderHistoryStore((state) => state.select);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  const handlePlaced = (order: Order) => {
    void queryClient.invalidateQueries({ queryKey: ['admin-orders', adminId] });
    // Open it in the list right away, so the admin sees where it went.
    selectOrder(adminId, order.id);
    toast.success(`Order #${order.referenceCode} created`);
    onClose();
  };

  const state = usePlaceOrderForm({
    initialServiceId: null,
    onPlaced: handlePlaced,
    placeOrder: (request) => orderPlacementService.placeOrderForCustomer(request, { customerPhone, ...(customerName.trim() ? { customerName: customerName.trim() } : {}) }),
  });

  const isPhoneValid = customerPhone !== '' && isValidPhoneNumber(customerPhone);
  const canSubmit = isPhoneValid && state.isReady && !state.isSubmitting;
  const missing = [...(isPhoneValid ? [] : ['কাস্টমারের নম্বর']), ...state.missingFields];

  return (
    <SidePanelShell title="New order" onClose={onClose}>
      <div className="pb-[24px]">
        <p className="mb-[16px] text-[13px] font-medium leading-relaxed text-[#697586]">
          For a customer who did not order in the app. A new number becomes a customer account; they can sign in later with this number.
        </p>
        <div className="mb-[8px]">
          <PhoneNumberField value={customerPhone} onChange={setCustomerPhone} />
          <OrderField icon={UserIcon}>
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={100} placeholder="Customer name (optional)" className={fieldControlClass} />
          </OrderField>
        </div>

        <ServiceAvatar category={state.category} subService={state.subService} />
        <ProblemSection state={state} />
        <ScheduleSection state={state} />

        {state.quote && <OrderQuoteSummary quote={state.quote} />}

        <div className="mt-[28px] flex justify-center">
          <button
            type="button"
            onClick={state.submit}
            disabled={!canSubmit}
            className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.isSubmitting ? 'Creating order...' : 'Create order'}
          </button>
        </div>
        {!canSubmit && missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-[#697586]">বাকি আছে: {missing.join(', ')}</p>}
      </div>
    </SidePanelShell>
  );
}
