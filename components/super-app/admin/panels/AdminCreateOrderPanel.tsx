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
import { CustomerLookup, orderPlacementService } from '@/services/order-placement.service';
import { useOrderHistoryStore } from '@/store/useOrderHistoryStore';
import { Order } from '@/types/order.types';
import { LayersIcon, UserIcon } from '@hugeicons/core-free-icons';
import { OrderField, OrderSelect, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { CustomServiceForm, CustomServiceSection, EMPTY_CUSTOM_SERVICE, customServiceMissing, parseCustomOrderPrice } from './CustomServiceSection';

/** Existing: a service from the catalog, priced by the backend. Custom: a service typed by hand, with its price. */
type OrderKind = 'EXISTING' | 'CUSTOM';

const ORDER_KIND_OPTIONS: Array<{ value: OrderKind; label: string }> = [
  { value: 'EXISTING', label: 'চালু সার্ভিস থেকে (Existing)' },
  { value: 'CUSTOM', label: 'কাস্টম সার্ভিস (Custom)' },
];

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'অর্ডার তৈরি করা যায়নি।';
};

/* One line under the number: a known customer (details filled in), a new number, or a number that is not a customer. */
export function CustomerLookupNote({ lookup }: { lookup: CustomerLookup }) {
  if (!lookup.found) {
    return <p className="mt-[8px] text-[12px] font-medium text-muted">নতুন নম্বর: অর্ডার দিলে নতুন কাস্টমার অ্যাকাউন্ট তৈরি হবে।</p>;
  }
  if (lookup.role !== 'CUSTOMER') {
    return <p className="mt-[8px] rounded-[8px] bg-[#fde8e8] px-[10px] py-[6px] text-[12px] font-semibold text-[#d64545]">এই নম্বরটি একজন {lookup.role.toLowerCase()}-এর, কাস্টমারের না। এই নম্বরে অর্ডার দেওয়া যাবে না।</p>;
  }
  if (lookup.status !== 'ACTIVE') {
    return <p className="mt-[8px] rounded-[8px] bg-[#fde8e8] px-[10px] py-[6px] text-[12px] font-semibold text-[#d64545]">এই কাস্টমার ব্লক করা আছেন।</p>;
  }
  return (
    <p className="mt-[8px] rounded-[8px] bg-secondary px-[10px] py-[6px] text-[12px] font-semibold text-ink">
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

  const [orderKind, setOrderKind] = useState<OrderKind>('EXISTING');
  const [custom, setCustom] = useState<CustomServiceForm>(EMPTY_CUSTOM_SERVICE);
  const [isPlacingCustom, setIsPlacingCustom] = useState(false);
  const isCustom = orderKind === 'CUSTOM';

  const isPhoneValid = customerPhone !== '' && isValidPhoneNumber(customerPhone);
  // A number of a provider / technician / staff, or a blocked customer: the backend refuses the order too.
  const cannotOrderFor = lookup?.found === true && (lookup.role !== 'CUSTOMER' || lookup.status !== 'ACTIVE');
  // A custom order is checked here: the catalog form's "problem" does not apply; place and time still do.
  const placeAndTimeMissing = state.missingFields.filter((field) => field !== 'সমস্যা');
  const formMissing = isCustom ? [...customServiceMissing(custom), ...placeAndTimeMissing] : state.missingFields;
  const isSubmitting = isCustom ? isPlacingCustom : state.isSubmitting;
  const canSubmit = isPhoneValid && !cannotOrderFor && formMissing.length === 0 && !isSubmitting;
  const missing = [...(isPhoneValid ? [] : ['কাস্টমারের নম্বর']), ...formMissing];
  const customPrice = parseCustomOrderPrice(custom.price);

  const submitCustom = async () => {
    if (!canSubmit || customPrice === null || !state.districtId || !state.upazilaId) return;
    setIsPlacingCustom(true);
    try {
      const { order } = await orderPlacementService.placeCustomOrderForCustomer({
        customerPhone,
        ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
        mainServiceName: custom.mainServiceName.trim(),
        subServiceName: custom.subServiceName.trim(),
        ...(custom.description.trim() ? { description: custom.description.trim() } : {}),
        price: customPrice,
        districtId: state.districtId,
        upazilaId: state.upazilaId,
        addressDetail: state.addressDetail.trim(),
        scheduledDate: state.scheduledDate,
        timeSlot: state.timeSlot,
      });
      handlePlaced(order);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsPlacingCustom(false);
    }
  };

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
        <ServiceAvatar category={isCustom ? undefined : state.category} subService={isCustom ? undefined : state.subService} />

        <div className="mb-[8px] pt-[40px]">
          <PhoneNumberField value={customerPhone} onChange={changePhone} />
          {lookup && <CustomerLookupNote lookup={lookup} />}
          <OrderField icon={UserIcon}>
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={100} placeholder="Customer name (optional)" className={fieldControlClass} />
          </OrderField>
        </div>

        {/* First the kind of order: a catalog service, or one typed by hand. The rest of the form follows it. */}
        <section className="mt-[16px] rounded-[16px] border border-line bg-white px-[16px] pb-[16px] pt-[1px]">
          <OrderSelect
            icon={LayersIcon}
            placeholder="অর্ডারের ধরন"
            value={orderKind}
            options={ORDER_KIND_OPTIONS}
            onChange={(value) => setOrderKind(value === 'CUSTOM' ? 'CUSTOM' : 'EXISTING')}
          />
          <p className="mt-[8px] text-[12px] font-medium leading-relaxed text-muted">
            {isCustom
              ? 'লিস্টে নেই এমন সার্ভিস: মেইন সার্ভিস, সাব-সার্ভিস, বিস্তারিত আর দাম নিজে লিখুন।'
              : 'লিস্ট থেকে সার্ভিস বেছে নিন, দাম নিজে থেকে হিসাব হবে।'}
          </p>
        </section>

        {isCustom ? <CustomServiceSection form={custom} onChange={setCustom} /> : <ProblemSection state={state} />}
        <ScheduleSection state={state} />

        {isCustom
          ? customPrice !== null && (
              <div className="mt-[20px] flex justify-between rounded-[12px] border border-line bg-surface p-[14px] text-[15px] font-semibold text-ink">
                <span>Total</span>
                <span>{formatTaka(customPrice)}</span>
              </div>
            )
          : state.quote && <OrderQuoteSummary quote={state.quote} />}

        <div className="mt-[28px] flex justify-center">
          <button
            type="button"
            onClick={isCustom ? submitCustom : state.submit}
            disabled={!canSubmit}
            className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {isSubmitting ? 'Creating order...' : 'Create order'}
          </button>
        </div>
        {!canSubmit && missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-muted">বাকি আছে: {missing.join(', ')}</p>}
      </div>
    </SidePanelShell>
  );
}
