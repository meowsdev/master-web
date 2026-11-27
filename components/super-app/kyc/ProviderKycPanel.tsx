'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon, Camera01Icon, Delete02Icon, Home01Icon, IdentityCardIcon, Location01Icon, LockIcon, PlusSignIcon, UserIcon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderField, OrderSelect, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { ProviderAreasSection } from '@/components/modals/profile/ProviderAreasSection';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { useProviderAreas } from '@/hooks/useProviderAreas';
import { useServiceAreaLabel } from '@/hooks/useServiceAreaLabel';
import { EmergencyContact, KycGender, MyKyc, providerKycService } from '@/services/provider-kyc.service';
import { KycImage } from './KycImage';
import { KycStatusCard } from './KycStatusCard';
import { PROVIDER_TERMS, PROVIDER_TERMS_TITLE, PROVIDER_TERMS_VERSION } from './provider-terms';

export const myKycQueryKey = (userId: string) => ['provider-kyc', userId];

const RELATIONS = ['বাবা', 'মা', 'ভাই', 'বোন', 'স্ত্রী', 'স্বামী', 'ছেলে', 'মেয়ে', 'আত্মীয়', 'বন্ধু'];
const GENDERS: Array<{ value: KycGender; label: string }> = [
  { value: 'MALE', label: 'পুরুষ' },
  { value: 'FEMALE', label: 'মহিলা' },
  { value: 'OTHER', label: 'অন্যান্য' },
];
const STEPS = ['ব্যক্তিগত তথ্য', 'NID ও ছবি', 'কাজের এলাকা', 'জরুরি যোগাযোগ'] as const;

const isBdMobile = (phone: string) => /^(?:\+?880|0)?1[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''));
const isNid = (nid: string) => /^(\d{10}|\d{13}|\d{17})$/.test(nid.replace(/\s/g, ''));
/** "+8801712345678" → "01712345678", the way people type it. */
const localPhone = (phone: string | null) => (phone ? phone.replace(/^\+?880/, '0') : '');
const EMPTY_CONTACT: EmergencyContact = { name: '', relation: '', phone: '' };
const BN_DIGITS = ['১', '২', '৩', '৪'];

const apiError = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

interface KycDraft {
  step: number;
  fullName: string;
  fatherName: string;
  motherName: string;
  contactPhone: string;
  gender: KycGender | '';
  districtId: number | null;
  upazilaId: number | null;
  postCode: string;
  addressDetail: string;
  nidNumber: string;
  tradeLicenseNo: string;
  nidFrontKey: string;
  nidBackKey: string;
  selfieKey: string;
  contacts: EmergencyContact[];
}

/** The form so far, from what was sent before (a rejected or pending one) or from the account. */
function startingDraft(info: MyKyc): KycDraft {
  const kyc = info.kyc;
  return {
    step: 0,
    fullName: kyc?.fullName ?? info.accountName ?? '',
    fatherName: kyc?.fatherName ?? '',
    motherName: kyc?.motherName ?? '',
    // Always the login number: shown, never edited (the server keeps it too).
    contactPhone: localPhone(info.accountPhone),
    gender: kyc?.gender ?? '',
    districtId: kyc?.districtId ?? null,
    upazilaId: kyc?.upazilaId ?? null,
    postCode: kyc?.postCode ?? '',
    addressDetail: kyc?.addressDetail ?? '',
    nidNumber: kyc?.nidNumber ?? '',
    tradeLicenseNo: kyc?.tradeLicenseNo ?? '',
    nidFrontKey: kyc?.nidFrontUrl ?? '',
    nidBackKey: kyc?.nidBackUrl ?? '',
    selfieKey: kyc?.selfieUrl ?? '',
    contacts: kyc?.emergencyContacts.length ? kyc.emergencyContacts.map((contact) => ({ ...contact, phone: localPhone(contact.phone) })) : [EMPTY_CONTACT, EMPTY_CONTACT],
  };
}

/*
 * The form being filled in, kept in memory only (never on the device) for this login, so closing the panel half
 * way and opening it again comes back to the same step with nothing lost. A reload starts again from the server.
 */
const useKycDraftStore = create<{ userId: string | null; draft: KycDraft | null; save: (userId: string, draft: KycDraft) => void; clear: () => void }>((set) => ({
  userId: null,
  draft: null,
  save: (userId, draft) => set({ userId, draft }),
  clear: () => set({ userId: null, draft: null }),
}));

/*
 * The provider's verification, on the right after login, in four steps that open one after another:
 * 1 personal details and the NID address, 2 NID number and pictures, 3 the areas they work in, 4 family numbers to
 * call when they cannot be reached, with a last look before sending. Sent for admin review; a rejection comes back
 * with the reason, to fix and send again. Approved: read-only.
 */
export function ProviderKycPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({ queryKey: myKycQueryKey(userId), queryFn: providerKycService.getMine });

  return (
    <SidePanelShell title="ভেরিফিকেশন (KYC)" onClose={onClose}>
      {isLoading && <p className="text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">তথ্য আনা যায়নি, একটু পরে আবার চেষ্টা করুন।</p>}
      {data && (
        <div className="pb-[24px]">
          <KycStatusCard info={data} />
          {data.kyc?.status === 'APPROVED' ? <ApprovedSummary info={data} /> : <KycWizard key={data.kyc?.submittedAt ?? 'new'} userId={userId} info={data} onSent={onClose} />}
        </div>
      )}
    </SidePanelShell>
  );
}

function ApprovedSummary({ info }: { info: MyKyc }) {
  const kyc = info.kyc!;
  return (
    <div className="mt-[16px] flex flex-col gap-[6px] text-[14px] font-medium text-ink">
      <p>নাম: {kyc.fullName}</p>
      <p>NID: {kyc.nidNumber}</p>
      <p>জরুরি যোগাযোগ: {kyc.emergencyContacts.map((contact) => `${contact.name} (${contact.relation})`).join(', ')}</p>
      <p className="mt-[8px] text-[12px] text-muted">তথ্য বদলাতে হলে সাপোর্টে যোগাযোগ করুন।</p>
    </div>
  );
}

function KycWizard({ userId, info, onSent }: { userId: string; info: MyKyc; onSent: () => void }) {
  const queryClient = useQueryClient();
  // The draft of this login if there is one (the panel was closed half way), else a fresh one. Read once on open,
  // not subscribed to: the wizard owns the draft while it is open.
  const [draft, setDraftState] = useState<KycDraft>(() => {
    const saved = useKycDraftStore.getState();
    return saved.userId === userId && saved.draft ? { ...saved.draft, contactPhone: localPhone(info.accountPhone) } : startingDraft(info);
  });
  const setDraft = (change: Partial<KycDraft>) => setDraftState((current) => ({ ...current, ...change }));
  // Kept for a reopen after every change, once the render is done (never while rendering).
  useEffect(() => {
    useKycDraftStore.getState().save(userId, draft);
  }, [userId, draft]);
  const { data: areas } = useProviderAreas(userId);
  const hasServiceAreas = areas ? areas.length > 0 : info.hasServiceAreas;
  const [isReadingTerms, setIsReadingTerms] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // What each step still needs; a step's Next opens only once its list is empty.
  const missingByStep: string[][] = [
    [
      draft.fullName.trim().length < 2 && 'নাম',
      draft.fatherName.trim().length < 2 && 'বাবার নাম',
      draft.motherName.trim().length < 2 && 'মায়ের নাম',
      !draft.gender && 'লিঙ্গ',
      (!draft.districtId || !draft.upazilaId) && 'জেলা ও উপজেলা',
      !/^\d{4}$/.test(draft.postCode) && 'পোস্ট কোড',
      draft.addressDetail.trim().length < 3 && 'বিস্তারিত ঠিকানা',
    ],
    [!isNid(draft.nidNumber) && 'NID নম্বর', !draft.nidFrontKey && 'NID সামনের ছবি', !draft.nidBackKey && 'NID পেছনের ছবি', !draft.selfieKey && 'নিজের ছবি'],
    [!hasServiceAreas && 'অন্তত একটি কাজের এলাকা'],
    [draft.contacts.some((contact) => contact.name.trim().length < 2 || !contact.relation || !isBdMobile(contact.phone)) && 'জরুরি যোগাযোগ'],
  ].map((items) => items.filter((item): item is string => Boolean(item)));
  const missing = missingByStep[draft.step];
  const isLast = draft.step === STEPS.length - 1;
  // A step can be reopened from the bar once every step before it is complete.
  const canOpenStep = (index: number) => missingByStep.slice(0, index).every((items) => items.length === 0);

  const submit = useMutation({
    mutationFn: () =>
      providerKycService.submit({
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
        acceptTerms: true,
        termsVersion: PROVIDER_TERMS_VERSION,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(myKycQueryKey(userId), result);
      useKycDraftStore.getState().clear();
      toast.success('ভেরিফিকেশন জমা হয়েছে। এডমিন যাচাই করে জানাবে।');
      onSent();
    },
    onError: (error) => toast.error(apiError(error, 'জমা দেওয়া যায়নি।')),
  });

  /*
   * After step 4: the provider terms, not a numbered step. Only the text, read through, then "I have read and
   * accept" and Submit & Confirm, which is what actually sends the verification.
   */
  if (isReadingTerms) {
    return (
      <ProviderTermsView
        hasAccepted={hasAcceptedTerms}
        onAcceptedChange={setHasAcceptedTerms}
        isSending={submit.isPending}
        onBack={() => setIsReadingTerms(false)}
        onConfirm={() => submit.mutate()}
      />
    );
  }

  return (
    <>
      <StepBar current={draft.step} isDone={(index) => missingByStep[index].length === 0 && index < draft.step} canOpen={canOpenStep} onOpen={(step) => setDraft({ step })} />

      <h3 className="mt-[18px] text-[16px] font-semibold text-ink">
        ধাপ {BN_DIGITS[draft.step]}: {STEPS[draft.step]}
      </h3>
      {draft.step === 0 && <PersonalStep draft={draft} setDraft={setDraft} />}
      {draft.step === 1 && <DocumentsStep draft={draft} setDraft={setDraft} />}
      {draft.step === 2 && (
        <>
          <p className="mt-[4px] text-[12px] font-medium text-muted">যেসব উপজেলায় গিয়ে কাজ করতে পারবেন সেগুলো বেছে নিন। এই এলাকার অর্ডারই আপনার কাছে আসবে।</p>
          <div className="mt-[8px]">
            <ProviderAreasSection userId={userId} />
          </div>
        </>
      )}
      {draft.step === 3 && <ContactsStep draft={draft} setDraft={setDraft} />}

      <div className="mt-[28px] flex items-center gap-[10px]">
        {draft.step > 0 && (
          <button type="button" onClick={() => setDraft({ step: draft.step - 1 })} className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface">
            পেছনে
          </button>
        )}
        <button
          type="button"
          disabled={missing.length > 0}
          onClick={() => {
            if (!isLast) return setDraft({ step: draft.step + 1 });
            // Not sent yet: the terms come first, read and accepted every time.
            setHasAcceptedTerms(false);
            setIsReadingTerms(true);
          }}
          className="h-[40px] flex-1 cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {isLast ? (info.kyc ? 'আবার জমা দিন' : 'জমা দিন') : 'পরবর্তী'}
        </button>
      </div>
      {missing.length > 0 && <p className="mt-[10px] text-center text-[12px] font-medium text-muted">বাকি আছে: {missing.join(', ')}</p>}
    </>
  );
}

/* The provider terms: text only, then the acceptance box and Submit & Confirm at the end of it. */
function ProviderTermsView({ hasAccepted, onAcceptedChange, isSending, onBack, onConfirm }: { hasAccepted: boolean; onAcceptedChange: (value: boolean) => void; isSending: boolean; onBack: () => void; onConfirm: () => void }) {
  return (
    <div className="mt-[16px]">
      <h3 className="text-[16px] font-semibold text-ink">{PROVIDER_TERMS_TITLE}</h3>
      <p className="mt-[4px] text-[12px] font-medium text-muted">জমা দেওয়ার আগে নিচের শর্তগুলো মন দিয়ে পড়ুন।</p>

      <div className="mt-[14px] flex flex-col gap-[16px] rounded-[12px] border border-line bg-white p-[14px]">
        {PROVIDER_TERMS.map((section) => (
          <section key={section.heading}>
            <h4 className="text-[14px] font-semibold text-ink">{section.heading}</h4>
            <ul className="mt-[6px] flex list-disc flex-col gap-[6px] pl-[18px] text-[13px] font-medium leading-relaxed text-ink">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <label className="mt-[16px] flex cursor-pointer items-start gap-[10px] rounded-[12px] bg-surface p-[12px]">
        <input type="checkbox" checked={hasAccepted} onChange={(event) => onAcceptedChange(event.target.checked)} className="mt-[2px] size-[18px] shrink-0 cursor-pointer accent-primary" />
        <span className="text-[13px] font-semibold leading-relaxed text-ink">
          আমি উপরের সব শর্ত পড়েছি, বুঝেছি এবং মেনে নিচ্ছি। আমার কাজ ও আচরণের সম্পূর্ণ দায়ভার আমার নিজের।
        </span>
      </label>

      <div className="mt-[20px] flex items-center gap-[10px]">
        <button type="button" disabled={isSending} onClick={onBack} className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface disabled:opacity-50">
          পেছনে
        </button>
        <button
          type="button"
          disabled={!hasAccepted || isSending}
          onClick={onConfirm}
          className="h-[40px] flex-1 cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {isSending ? 'জমা হচ্ছে...' : 'Submit & Confirm'}
        </button>
      </div>
      {!hasAccepted && <p className="mt-[10px] text-center text-[12px] font-medium text-muted">জমা দিতে আগে শর্তগুলো মেনে নেওয়ার ঘরে টিক দিন।</p>}
    </div>
  );
}

/* 1 ─ 2 ─ 3 ─ 4: done steps show a tick and can be reopened; later steps stay shut until the ones before are complete. */
function StepBar({ current, isDone, canOpen, onOpen }: { current: number; isDone: (index: number) => boolean; canOpen: (index: number) => boolean; onOpen: (index: number) => void }) {
  return (
    <ol className="mt-[16px] flex items-start">
      {STEPS.map((label, index) => {
        const isCurrent = index === current;
        const done = isDone(index);
        const isOpenable = !isCurrent && canOpen(index);
        return (
          <li key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={`h-[2px] flex-1 ${index === 0 ? 'opacity-0' : index <= current ? 'bg-primary' : 'bg-line'}`} />
              <button
                type="button"
                disabled={!isOpenable}
                onClick={() => onOpen(index)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`ধাপ ${BN_DIGITS[index]}: ${label}`}
                className={`flex size-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                  isCurrent ? 'bg-primary text-white ring-4 ring-secondary' : done ? 'bg-secondary text-ink' : 'border border-chip bg-white text-muted'
                } ${isOpenable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {done ? '✓' : BN_DIGITS[index]}
              </button>
              <span className={`h-[2px] flex-1 ${index === STEPS.length - 1 ? 'opacity-0' : index < current ? 'bg-primary' : 'bg-line'}`} />
            </div>
            <span className={`mt-[6px] text-center text-[11px] font-semibold leading-[14px] ${isCurrent ? 'text-ink' : 'text-muted'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

type StepProps = { draft: KycDraft; setDraft: (change: Partial<KycDraft>) => void };

/* Step 1: who they are, and the address written on their NID. */
function PersonalStep({ draft, setDraft }: StepProps) {
  const { districts, upazilas } = useLocationOptions(draft.districtId);
  return (
    <>
      <OrderField icon={UserIcon}>
        <input value={draft.fullName} onChange={(event) => setDraft({ fullName: event.target.value })} maxLength={100} placeholder="আপনার নাম (NID অনুযায়ী)" className={fieldControlClass} />
      </OrderField>
      <OrderField icon={UserIcon}>
        <input value={draft.fatherName} onChange={(event) => setDraft({ fatherName: event.target.value })} maxLength={100} placeholder="বাবার নাম" className={fieldControlClass} />
      </OrderField>
      <OrderField icon={UserIcon}>
        <input value={draft.motherName} onChange={(event) => setDraft({ motherName: event.target.value })} maxLength={100} placeholder="মায়ের নাম" className={fieldControlClass} />
      </OrderField>
      <OrderField icon={Call02Icon}>
        {/* The login number: it identifies the account (and every role on it), so it cannot be changed here. */}
        <input value={draft.contactPhone} readOnly aria-readonly="true" aria-label="ফোন নম্বর" className={`${fieldControlClass} cursor-not-allowed text-muted`} />
        <HugeiconsIcon icon={LockIcon} size={16} className="shrink-0 text-muted" />
      </OrderField>
      <p className="mt-[4px] text-[12px] font-medium text-muted">লগইনের নম্বর, বদলানো যাবে না।</p>

      <p className="mt-[20px] text-[13px] font-semibold text-ink">লিঙ্গ</p>
      <div className="mt-[8px] flex gap-[8px]" role="radiogroup" aria-label="লিঙ্গ">
        {GENDERS.map((gender) => (
          <button
            key={gender.value}
            type="button"
            role="radio"
            aria-checked={draft.gender === gender.value}
            onClick={() => setDraft({ gender: gender.value })}
            className={`h-[36px] flex-1 cursor-pointer rounded-[20px] border text-[14px] font-semibold transition-colors ${draft.gender === gender.value ? 'border-secondary bg-secondary text-ink' : 'border-chip text-muted hover:text-ink'}`}
          >
            {gender.label}
          </button>
        ))}
      </div>

      <p className="mt-[20px] text-[13px] font-semibold text-ink">ঠিকানা (NID অনুযায়ী)</p>
      <OrderSelect
        icon={Location01Icon}
        placeholder="জেলা"
        value={draft.districtId ? String(draft.districtId) : ''}
        options={districts.map((item) => ({ value: String(item.id), label: item.bnName || item.name }))}
        onChange={(value) => setDraft({ districtId: value ? Number(value) : null, upazilaId: null })}
      />
      <OrderSelect
        icon={Location01Icon}
        placeholder="উপজেলা"
        value={draft.upazilaId ? String(draft.upazilaId) : ''}
        disabled={!draft.districtId}
        options={upazilas.map((item) => ({ value: String(item.id), label: item.bnName || item.name }))}
        onChange={(value) => setDraft({ upazilaId: value ? Number(value) : null })}
      />
      <OrderField icon={Location01Icon}>
        <input value={draft.postCode} onChange={(event) => setDraft({ postCode: event.target.value.replace(/\D/g, '').slice(0, 4) })} inputMode="numeric" placeholder="পোস্ট কোড (৪ সংখ্যা)" className={fieldControlClass} />
      </OrderField>
      <OrderField icon={Home01Icon}>
        <input value={draft.addressDetail} onChange={(event) => setDraft({ addressDetail: event.target.value })} maxLength={300} placeholder="গ্রাম / রোড / বাসা নম্বর" className={fieldControlClass} />
      </OrderField>
    </>
  );
}

/* Step 2: the NID number, both sides of the card and a photo of the provider. */
function DocumentsStep({ draft, setDraft }: StepProps) {
  return (
    <>
      <OrderField icon={IdentityCardIcon}>
        <input value={draft.nidNumber} onChange={(event) => setDraft({ nidNumber: event.target.value.replace(/[^\d\s]/g, '') })} inputMode="numeric" maxLength={20} placeholder="NID নম্বর (১০, ১৩ বা ১৭ সংখ্যা)" className={fieldControlClass} />
      </OrderField>
      {draft.nidNumber.trim() !== '' && !isNid(draft.nidNumber) && <p className="mt-[4px] text-[12px] font-medium text-[#d64545]">NID নম্বর ১০, ১৩ বা ১৭ সংখ্যার হয়।</p>}
      <OrderField icon={IdentityCardIcon}>
        <input value={draft.tradeLicenseNo} onChange={(event) => setDraft({ tradeLicenseNo: event.target.value })} maxLength={40} placeholder="ট্রেড লাইসেন্স নম্বর (থাকলে)" className={fieldControlClass} />
      </OrderField>
      <div className="mt-[18px] grid grid-cols-3 gap-[8px]">
        <DocumentUpload label="NID সামনে" fileKey={draft.nidFrontKey} onUploaded={(nidFrontKey) => setDraft({ nidFrontKey })} />
        <DocumentUpload label="NID পেছনে" fileKey={draft.nidBackKey} onUploaded={(nidBackKey) => setDraft({ nidBackKey })} />
        <DocumentUpload label="নিজের ছবি" fileKey={draft.selfieKey} onUploaded={(selfieKey) => setDraft({ selfieKey })} isPhoto />
      </div>
      <p className="mt-[8px] text-[12px] font-medium text-muted">ছবি স্পষ্ট হতে হবে, লেখা পড়া যায় এমন। শুধু আপনি আর এডমিন এই ছবি দেখতে পারবে।</p>
    </>
  );
}

/* Step 4: two or three family numbers, then a last look at everything before it is sent. */
function ContactsStep({ draft, setDraft }: StepProps) {
  const setContact = (index: number, change: Partial<EmergencyContact>) =>
    setDraft({ contacts: draft.contacts.map((contact, i) => (i === index ? { ...contact, ...change } : contact)) });
  const homeArea = useServiceAreaLabel(draft.districtId, draft.upazilaId);
  const gender = GENDERS.find((item) => item.value === draft.gender)?.label;

  return (
    <>
      <p className="mt-[4px] text-[12px] font-medium text-muted">আপনার নম্বরে না পেলে পরিবারের এই নম্বরগুলোতে যোগাযোগ করা হবে। নিজের নম্বর দেবেন না। ({draft.contacts.length}/৩)</p>
      {draft.contacts.map((contact, index) => (
        <div key={index} className="mt-[10px] rounded-[12px] border border-line bg-white px-[12px] pb-[12px]">
          <div className="flex items-center justify-between pt-[10px]">
            <span className="text-[13px] font-semibold text-ink">যোগাযোগ {BN_DIGITS[index]}</span>
            {draft.contacts.length > 2 && (
              <button type="button" onClick={() => setDraft({ contacts: draft.contacts.filter((_, i) => i !== index) })} aria-label="মুছুন" className="cursor-pointer text-muted hover:text-[#d64545]">
                <HugeiconsIcon icon={Delete02Icon} size={18} />
              </button>
            )}
          </div>
          <OrderField icon={UserIcon}>
            <input value={contact.name} onChange={(event) => setContact(index, { name: event.target.value })} maxLength={60} placeholder="নাম" className={fieldControlClass} />
          </OrderField>
          <OrderSelect icon={UserIcon} placeholder="সম্পর্ক" value={contact.relation} options={RELATIONS.map((relation) => ({ value: relation, label: relation }))} onChange={(value) => setContact(index, { relation: value })} />
          <OrderField icon={Call02Icon}>
            <input value={contact.phone} onChange={(event) => setContact(index, { phone: event.target.value })} inputMode="tel" maxLength={16} placeholder="মোবাইল নম্বর (01XXXXXXXXX)" className={fieldControlClass} />
          </OrderField>
          {contact.phone.trim() !== '' && !isBdMobile(contact.phone) && <p className="mt-[4px] text-[12px] font-medium text-[#d64545]">সঠিক মোবাইল নম্বর লিখুন।</p>}
        </div>
      ))}
      {draft.contacts.length < 3 && (
        <button type="button" onClick={() => setDraft({ contacts: [...draft.contacts, EMPTY_CONTACT] })} className="mt-[10px] flex cursor-pointer items-center gap-[6px] text-[14px] font-semibold text-primary">
          <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.5} />
          আরেকটি নম্বর যোগ করুন
        </button>
      )}

      {/* A last look before sending. */}
      <div className="mt-[20px] rounded-[12px] bg-surface p-[12px] text-[13px] font-medium text-ink">
        <p className="mb-[6px] text-[13px] font-semibold">জমা দেওয়ার আগে মিলিয়ে নিন</p>
        <p>{draft.fullName} · {gender}</p>
        <p className="text-muted">বাবা: {draft.fatherName} · মা: {draft.motherName}</p>
        <p className="text-muted">ফোন: {draft.contactPhone} · NID: {draft.nidNumber}</p>
        <p className="text-muted">ঠিকানা: {[draft.addressDetail, homeArea, draft.postCode].filter(Boolean).join(', ')}</p>
      </div>
    </>
  );
}

/* One private picture: tap to choose, it uploads at once and shows from the server. */
function DocumentUpload({ label, fileKey, onUploaded, isPhoto = false }: { label: string; fileKey: string; onUploaded: (key: string) => void; isPhoto?: boolean }) {
  const upload = useMutation({
    mutationFn: providerKycService.uploadDocument,
    onSuccess: (result) => onUploaded(result.key),
    onError: (error) => toast.error(apiError(error, 'ছবি আপলোড হয়নি।')),
  });

  return (
    <label className="flex cursor-pointer flex-col items-center gap-[6px]">
      <span className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[10px] border ${fileKey ? 'border-primary' : 'border-dashed border-chip'} bg-surface`}>
        {fileKey ? <KycImage key={fileKey} fileKey={fileKey} alt={label} className="size-full" /> : <HugeiconsIcon icon={isPhoto ? Camera01Icon : IdentityCardIcon} size={26} className="text-muted" />}
        {upload.isPending && <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[12px] font-semibold text-ink">আপলোড...</span>}
      </span>
      <span className="text-center text-[12px] font-semibold text-ink">{fileKey ? `${label} ✓` : label}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={isPhoto ? 'user' : undefined}
        className="hidden"
        disabled={upload.isPending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) {
            toast.error('ছবি ৫ MB-এর কম হতে হবে।');
            return;
          }
          upload.mutate(file);
        }}
      />
    </label>
  );
}
