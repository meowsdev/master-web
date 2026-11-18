'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckmarkCircle02Icon, Location01Icon, Store01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { PhoneNumberField } from '@/components/modals/auth/PhoneNumberField';
import { OrderField, OrderSelect, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { useAddMember } from '@/hooks/useAddMember';
import { adminService } from '@/services/admin.service';
import { SupportMemberRole } from '@/types/support-chat.types';

const TITLE: Record<SupportMemberRole, string> = { PROVIDER: 'Add provider', TECHNICIAN: 'Add technician', CUSTOMER: 'Add customer' };

const NOTE: Record<SupportMemberRole, string> = {
  PROVIDER: 'The number becomes a provider account; they sign in with it by OTP. If you choose a location it is also the area they take orders in. They enable the services they offer themselves.',
  TECHNICIAN: 'The number becomes a technician account. A technician works under a provider, who you can choose now or change later.',
  CUSTOMER: 'The number becomes a customer account; they sign in with it by OTP.',
};

/* One form to add a provider, technician or customer, opened by the + above their list. Everything is validated by the backend. */
export function AdminAddMemberPanel({ adminId, role, onClose }: { adminId: string; role: SupportMemberRole; onClose: () => void }) {
  const form = useAddMember(adminId, role, onClose);
  // The providers a technician can be placed under.
  const { data: providers = [] } = useQuery({ queryKey: ['admin-providers'], queryFn: adminService.listProviders, enabled: role === 'TECHNICIAN' });
  const { locations } = form;

  return (
    <SidePanelShell title={TITLE[role]} onClose={onClose}>
      <div className="pb-[24px]">
        <p className="mb-[8px] text-[13px] font-medium leading-relaxed text-[#697586]">{NOTE[role]}</p>
        <PhoneNumberField value={form.phone} onChange={form.setPhone} />
        <OrderField icon={UserIcon}>
          <input value={form.name} onChange={(event) => form.setName(event.target.value)} maxLength={100} placeholder={role === 'TECHNICIAN' ? 'Name' : 'Name (optional)'} className={fieldControlClass} />
        </OrderField>

        {role === 'PROVIDER' && (
          <OrderField icon={Store01Icon}>
            <input value={form.companyName} onChange={(event) => form.setCompanyName(event.target.value)} maxLength={120} placeholder="Company name (optional)" className={fieldControlClass} />
          </OrderField>
        )}

        {role === 'TECHNICIAN' ? (
          <OrderSelect
            icon={Store01Icon}
            placeholder="No provider yet"
            value={form.providerProfileId}
            options={providers.map((provider) => ({ value: provider.id, label: provider.companyName || provider.user.name || provider.user.username || provider.user.mobileNumber }))}
            onChange={form.setProviderProfileId}
          />
        ) : (
          <>
            <OrderSelect
              icon={CheckmarkCircle02Icon}
              placeholder="জেলা (optional)"
              value={form.districtId}
              options={locations.districts.map((district) => ({ value: district.id, label: district.bnName || district.name }))}
              onChange={(value) => form.selectDistrict(value ? Number(value) : null)}
            />
            <OrderSelect
              icon={Location01Icon}
              placeholder="উপজেলা"
              value={form.upazilaId}
              disabled={form.districtId === null}
              options={locations.upazilas.map((upazila) => ({ value: upazila.id, label: upazila.bnName || upazila.name }))}
              onChange={(value) => form.setUpazilaId(value ? Number(value) : null)}
            />
          </>
        )}

        <div className="mt-[28px] flex justify-center">
          <button
            type="button"
            onClick={form.save}
            disabled={form.missing.length > 0 || form.isSaving}
            className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.isSaving ? 'Adding...' : TITLE[role]}
          </button>
        </div>
        {form.missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-[#697586]">বাকি আছে: {form.missing.join(', ')}</p>}
      </div>
    </SidePanelShell>
  );
}
