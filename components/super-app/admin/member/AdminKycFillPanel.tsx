'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderSelect } from '@/components/modals/place-order/OrderField';
import { useAdminMember } from '@/hooks/useAdminMember';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { KycGender, MemberKyc, providerKycService } from '@/services/provider-kyc.service';
import { ContactsStep, DocumentsStep, KycDraft, PersonalStep, emptyKycDraft, kycMissingByStep, localPhone } from '../../kyc/ProviderKycPanel';

type Area = { districtId: number; upazilaId: number; name?: string | null };

const sectionTitle = 'mb-[2px] mt-[24px] text-[13px] font-semibold uppercase tracking-[0.4px] text-muted';

const apiError = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/** The form started from what the provider already sent (if anything), else empty with their login number. */
function draftFrom(info: MemberKyc): KycDraft {
  const kyc = info.kyc;
  const empty = emptyKycDraft(info.mobileNumber);
  if (!kyc) return { ...empty, fullName: info.accountName ?? '' };
  return {
    ...empty,
    fullName: kyc.fullName ?? info.accountName ?? '',
    fatherName: kyc.fatherName ?? '',
    motherName: kyc.motherName ?? '',
    gender: kyc.gender ?? '',
    districtId: kyc.districtId,
    upazilaId: kyc.upazilaId,
    postCode: kyc.postCode ?? '',
    addressDetail: kyc.addressDetail ?? '',
    nidNumber: kyc.nidNumber ?? '',
    tradeLicenseNo: kyc.tradeLicenseNo ?? '',
    nidFrontKey: kyc.nidFrontUrl ?? '',
    nidBackKey: kyc.nidBackUrl ?? '',
    selfieKey: kyc.selfieUrl ?? '',
    contacts: kyc.emergencyContacts.length ? kyc.emergencyContacts.map((contact) => ({ ...contact, phone: localPhone(contact.phone) })) : empty.contacts,
  };
}

/*
 * Admin: fill in a provider's whole KYC and verify it at once, e.g. to get them working before they have opened the
 * app. The same fields and checks as the provider's own form, the pictures uploaded on their behalf (they are the
 * provider's files), and the areas they work in. Saved as approved; the provider reads and accepts the provider terms
 * themselves on their first visit.
 */
export function AdminKycFillPanel({ adminId, memberId, onClose }: { adminId: string; memberId: string; onClose: () => void }) {
  const { data: member } = useAdminMember(adminId, memberId);
  const { data: info, isLoading, isError } = useQuery({ queryKey: ['admin-member-kyc', adminId, memberId], queryFn: () => providerKycService.getForMember(memberId) });

  return (
    <SidePanelShell title="KYC পূরণ করে ভেরিফাই" onClose={onClose}>
      {(isLoading || !member) && !isError && <p className="text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">তথ্য আনা যায়নি।</p>}
      {info && member && (
        <FillForm
          adminId={adminId}
          memberId={memberId}
          info={info}
          initialAreas={(member.provider?.areas ?? []).map(({ districtId, upazilaId, name }) => ({ districtId, upazilaId, name }))}
          onDone={onClose}
        />
      )}
    </SidePanelShell>
  );
}

function FillForm({ adminId, memberId, info, initialAreas, onDone }: { adminId: string; memberId: string; info: MemberKyc; initialAreas: Area[]; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [draft, setDraftState] = useState<KycDraft>(() => draftFrom(info));
  const setDraft = (change: Partial<KycDraft>) => setDraftState((current) => ({ ...current, ...change }));
  const [areas, setAreas] = useState<Area[]>(initialAreas);
  const missing = kycMissingByStep(draft, areas.length > 0).flat();

  const verify = useMutation({
    mutationFn: () =>
      providerKycService.verifyForMember(memberId, {
        fullName: draft.fullName.trim(),
        fatherName: draft.fatherName.trim(),
        motherName: draft.motherName.trim(),
        gender: draft.gender as KycGender,
        postCode: draft.postCode,
        districtId: draft.districtId!,
        upazilaId: draft.upazilaId!,
        addressDetail: draft.addressDetail.trim(),
        nidNumber: draft.nidNumber.replace(/\s/g, ''),
        nidFrontKey: draft.nidFrontKey,
        nidBackKey: draft.nidBackKey,
        selfieKey: draft.selfieKey,
        ...(draft.tradeLicenseNo.trim() ? { tradeLicenseNo: draft.tradeLicenseNo.trim() } : {}),
        emergencyContacts: draft.contacts.map((contact) => ({ name: contact.name.trim(), relation: contact.relation, phone: contact.phone.trim() })),
        serviceAreas: areas.map(({ districtId, upazilaId }) => ({ districtId, upazilaId })),
      }),
    onSuccess: () => {
      toast.success('KYC পূরণ ও ভেরিফাই হয়েছে। প্রোভাইডার এখন অর্ডার পাবে।');
      void queryClient.invalidateQueries({ queryKey: ['admin-member-kyc', adminId, memberId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-member', adminId, memberId] });
      onDone();
    },
    onError: (error) => toast.error(apiError(error, 'সেভ করা যায়নি।')),
  });

  return (
    <div className="pb-[24px]">
      <p className="rounded-[12px] bg-surface p-[12px] text-[12px] font-medium leading-relaxed text-muted">
        প্রোভাইডারের হয়ে সব তথ্য পূরণ করুন। সেভ করলে সাথে সাথে ভেরিফাইড হবে এবং অর্ডার পাবে। প্রোভাইডার প্রথমবার অ্যাপ খুললে শর্তাবলি পড়ে নিজে মেনে নেবে।
      </p>

      <p className={sectionTitle}>১. ব্যক্তিগত তথ্য</p>
      <PersonalStep draft={draft} setDraft={setDraft} />

      <p className={sectionTitle}>২. NID ও ছবি</p>
      <DocumentsStep draft={draft} setDraft={setDraft} upload={(file) => providerKycService.uploadForMember(memberId, file)} />

      <p className={sectionTitle}>৩. কাজের এলাকা</p>
      <AreaPicker areas={areas} onChange={setAreas} />

      <p className={sectionTitle}>৪. জরুরি যোগাযোগ</p>
      <ContactsStep draft={draft} setDraft={setDraft} />

      <div className="mt-[24px]">
        <button
          type="button"
          disabled={missing.length > 0 || verify.isPending}
          onClick={() => verify.mutate()}
          className="h-[40px] w-full cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {verify.isPending ? 'সেভ হচ্ছে...' : 'সেভ ও ভেরিফাই করুন'}
        </button>
        {missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-muted">বাকি আছে: {missing.join(', ')}</p>}
      </div>
    </div>
  );
}

/* The provider's work areas: pick a district, tick its upazilas; each chosen one shows as a removable chip. */
function AreaPicker({ areas, onChange }: { areas: Area[]; onChange: (areas: Area[]) => void }) {
  const [districtId, setDistrictId] = useState<number | null>(null);
  const { districts, upazilas } = useLocationOptions(districtId);
  const isChosen = (upazilaId: number) => areas.some((area) => area.upazilaId === upazilaId);
  const toggle = (upazila: { id: number; districtId: number; bnName: string; name: string }) =>
    onChange(isChosen(upazila.id) ? areas.filter((area) => area.upazilaId !== upazila.id) : [...areas, { districtId: upazila.districtId, upazilaId: upazila.id, name: upazila.bnName || upazila.name }]);

  return (
    <>
      {areas.length > 0 && (
        <div className="mt-[10px] flex flex-wrap gap-[6px]">
          {areas.map((area) => (
            <span key={area.upazilaId} className="flex items-center gap-[4px] rounded-full bg-secondary px-[10px] py-[4px] text-[12px] font-semibold text-ink">
              {area.name ?? area.upazilaId}
              <button type="button" aria-label="বাদ দিন" onClick={() => onChange(areas.filter((item) => item.upazilaId !== area.upazilaId))} className="cursor-pointer">
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <OrderSelect
        icon={Location01Icon}
        placeholder="জেলা বেছে নিন"
        value={districtId ? String(districtId) : ''}
        options={districts.map((item) => ({ value: String(item.id), label: item.bnName || item.name }))}
        onChange={(value) => setDistrictId(value ? Number(value) : null)}
      />
      {districtId && (
        <div className="mt-[10px] grid max-h-[200px] grid-cols-2 gap-[6px] overflow-y-auto rounded-[10px] border border-line bg-white p-[10px]">
          {upazilas.map((upazila) => (
            <label key={upazila.id} className="flex cursor-pointer items-center gap-[6px] text-[13px] font-medium text-ink">
              <input type="checkbox" checked={isChosen(upazila.id)} onChange={() => toggle(upazila)} className="size-[16px] accent-primary" />
              {upazila.bnName || upazila.name}
            </label>
          ))}
        </div>
      )}
      {areas.length === 0 && <p className="mt-[6px] text-[12px] font-medium text-[#d64545]">অন্তত একটি উপজেলা বেছে নিন।</p>}
    </>
  );
}
