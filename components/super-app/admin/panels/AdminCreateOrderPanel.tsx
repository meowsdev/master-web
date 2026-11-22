'use client';

import { useRef, useState } from 'react';
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
import { CustomerLookup, orderPlacementService } from '@/services/order-placement.service';import { useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { Order } from '@/types/order.types';
import { UserIcon } from '@hugeicons/core-free-icons';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';

/* One line under the number: a known customer (details filled in), a new number, or a number that is not a customer. */
function CustomerLookupNote({ lookup }: { lookup: CustomerLookup }) {
  if (!lookup.found) {
    return <p className="mt-[8px] text-[12px] font-medium text-[#697586]">নতুন নম্বর: অর্ডার দিলে নতুন কাস্টমার অ্যাকাউন্ট তৈরি হবে।</p>;
  }
  if (lookup.role !== 'CUSTOMER') {
    return <p className="mt-[8px] rounded-[8px] bg-[#fde8e8] px-[10px] py-[6px] text-[12px] font-semibold text-[#d64545]">এই নম্বরটি একজন {lookup.role.toLowerCase()}-এর, কাস্টমারের না। এই নম্বরে অর্ডার দেওয়া যাবে না।</p>;
  }
  if (lookup.status !== 'ACTIVE') {
    return <p className="mt-[8px] rounded-[8px] bg-[#fde8e8] px-[10px] py-[6px] text-[12px] font-semibold text-[#d64545]">এই কাস্টমার ব্লক করা আছেন।</p>;
  }
  return (
    <p className="mt-[8px] rounded-[8px] bg-[#e7fce3] px-[10px] py-[6px] text-[12px] font-semibold text-[#205737]">
      ✓ পুরোনো কাস্টমার{lookup.name ? `: ${lookup.name}` : ''}। নাম ও ঠিকানা বসিয়ে দেওয়া হয়েছে, দরকার হলে বদলাতে পারবেন।
    </p>
  );
}

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
  const [lookup, setLookup] = useState<CustomerLookup | null>(null);
  // The number the latest lookup belongs to, and what it filled in (so a changed number clears only that).
  const latestPhone = useRef('');
  const autoFilled = useRef({ name: '', address: '' });

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
    placeOrder: (request) =>
      orderPlacementService.placeOrderForCustomer(request, {
        customerPhone,
        ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
      }),
  });

  const isPhoneValid = customerPhone !== '' && isValidPhoneNumber(customerPhone);
  // A number of a provider / technician / staff, or a blocked customer: the backend refuses the order too.
  const cannotOrderFor = lookup?.found === true && (lookup.role !== 'CUSTOMER' || lookup.status !== 'ACTIVE');
  const canSubmit = isPhoneValid && !cannotOrderFor && state.isReady && !state.isSubmitting;
  const missing = [...(isPhoneValid ? [] : ['কাস্টমারের নম্বর']), ...state.missingFields];

  /*
   * A complete number is looked up at once. A registered customer's name and last place fill the form;
   * values filled for a previous number are cleared when the number changes, while anything the admin
   * typed themselves is kept.
   */
  const changePhone = (next: string) => {
    setCustomerPhone(next);
    latestPhone.current = next;
    setLookup(null);
    if (!next || !isValidPhoneNumber(next)) return;
    orderPlacementService
      .lookupCustomer(next)
      .then((result) => {
        if (latestPhone.current !== next) return; // the number changed while this was loading
        setLookup(result);
        const filled = autoFilled.current;
        const isCustomer = result.found && result.role === 'CUSTOMER';

        const name = isCustomer ? (result.name ?? '') : '';
        setCustomerName((current) => (current.trim() === '' || current === filled.name ? name : current));
        filled.name = name;

        const address = isCustomer ? (result.addressDetail ?? '') : '';
        if (state.addressDetail.trim() === '' || state.addressDetail === filled.address) state.setAddressDetail(address);
        filled.address = address;

        if (isCustomer && result.districtId && result.upazilaId) {
          state.selectDistrict(result.districtId);
          state.setUpazilaId(result.upazilaId);
        }
      })
      .catch(() => undefined); // only a convenience: the admin can still fill everything in by hand
  };

  return (
    <SidePanelShell title="New order" onClose={onClose}>
      <div className="pb-[24px]">
        <ServiceAvatar category={state.category} subService={state.subService} />

        <div className="mb-[8px] pt-[40px]">
          <PhoneNumberField value={customerPhone} onChange={changePhone} />
          {lookup && <CustomerLookupNote lookup={lookup} />}
          <OrderField icon={UserIcon}>
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={100} placeholder="Customer name (optional)" className={fieldControlClass} />
          </OrderField>
        </div>

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
