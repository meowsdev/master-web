'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fieldControlClass } from '@/components/modals/place-order/OrderField';
import { useServiceAreaLabel } from '@/hooks/useServiceAreaLabel';
import { providerKycService } from '@/services/provider-kyc.service';
import { KycImage } from '../../kyc/KycImage';
import { KycStatusCard } from '../../kyc/KycStatusCard';
import { Fact, Section, formatDate } from './MemberParts';

const GENDER_LABEL: Record<string, string> = { MALE: 'পুরুষ', FEMALE: 'মহিলা', OTHER: 'অন্যান্য' };

/** Common reasons to send a verification back, one tap each. */
const REJECT_REASONS = [
  'NID-এর ছবি অস্পষ্ট।',
  'NID-এর দুই পাশের ছবি লাগবে।',
  'নিজের ছবি স্পষ্ট নয় বা NID-এর সাথে মেলে না।',
  'নাম NID-এর সাথে মেলে না।',
  'NID নম্বর ভুল।',
  'ঠিকানা অসম্পূর্ণ।',
  'জরুরি যোগাযোগের নম্বরে পাওয়া যায়নি।',
];

const apiError = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/*
 * Staff: a provider's verification on their details panel: who they are, where they live, the NID and their photo
 * side by side, and the family numbers to call. An admin approves it, or rejects it with the reason the provider sees.
 */
export function ProviderKycSection({ adminId, memberId, canReview }: { adminId: string; memberId: string; canReview: boolean }) {
  const queryClient = useQueryClient();
  const queryKey = ['admin-member-kyc', adminId, memberId];
  const { data, isLoading, isError } = useQuery({ queryKey, queryFn: () => providerKycService.getForMember(memberId) });
  const [reason, setReason] = useState('');
  const [needsReason, setNeedsReason] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const kyc = data?.kyc ?? null;
  const homeArea = useServiceAreaLabel(kyc?.districtId, kyc?.upazilaId);

  const review = useMutation({
    mutationFn: (status: 'APPROVED' | 'REJECTED') => providerKycService.review(kyc!.id, status, reason.trim() || undefined),
    onSuccess: (_result, status) => {
      toast.success(status === 'APPROVED' ? 'ভেরিফিকেশন অনুমোদিত। প্রোভাইডার এখন অর্ডার পাবে।' : 'ফেরত পাঠানো হয়েছে, প্রোভাইডার কারণ দেখবে।');
      setReason('');
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['admin-member', adminId, memberId] });
    },
    onError: (error) => toast.error(apiError(error, 'করা যায়নি।')),
  });

  return (
    <Section title="Verification (KYC)">
      {isLoading && <p className="text-[14px] font-medium text-muted">Loading...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">Could not load the verification.</p>}
      {data && <KycStatusCard info={data} />}
      {data && !kyc && <p className="mt-[8px] text-[13px] font-medium text-muted">এখনো জমা দেয়নি।</p>}

      {kyc && (
        <>
          <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
            {[
              { key: kyc.nidFrontUrl, label: 'NID সামনে' },
              { key: kyc.nidBackUrl, label: 'NID পেছনে' },
              { key: kyc.selfieUrl, label: 'ছবি' },
            ].map((picture) => (
              <figure key={picture.label} className="flex flex-col gap-[4px]">
                {picture.key ? (
                  <KycImage key={picture.key} fileKey={picture.key} alt={picture.label} className="aspect-[4/3] w-full rounded-[8px]" />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[8px] bg-surface text-[11px] text-muted">নেই</div>
                )}
                <figcaption className="text-center text-[11px] font-semibold text-muted">{picture.label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-[8px]">
            <Fact label="Name (NID)">{kyc.fullName ?? '—'}</Fact>
            {kyc.fatherName && <Fact label="Father">{kyc.fatherName}</Fact>}
            {kyc.motherName && <Fact label="Mother">{kyc.motherName}</Fact>}
            {kyc.gender && <Fact label="Gender">{GENDER_LABEL[kyc.gender] ?? kyc.gender}</Fact>}
            {kyc.contactPhone && (
              <Fact label="Contact phone">
                <a href={`tel:${kyc.contactPhone}`} className="text-primary">{kyc.contactPhone}</a>
              </Fact>
            )}
            <Fact label="NID">{kyc.nidNumber ?? '—'}</Fact>
            {kyc.tradeLicenseNo && <Fact label="Trade license">{kyc.tradeLicenseNo}</Fact>}
            <Fact label="NID address">{[kyc.addressDetail, homeArea, kyc.postCode].filter(Boolean).join(', ') || '—'}</Fact>
            {kyc.submittedAt && <Fact label="Sent">{formatDate(kyc.submittedAt)}</Fact>}
            <Fact label="Provider terms">{kyc.termsAcceptedAt ? `Accepted ${formatDate(kyc.termsAcceptedAt)} (v${kyc.termsVersion ?? '?'})` : 'Not accepted'}</Fact>
            {kyc.reviewedAt && <Fact label="Reviewed">{formatDate(kyc.reviewedAt)}</Fact>}
          </div>

          <p className="mb-[6px] mt-[12px] text-[13px] font-semibold text-ink">জরুরি যোগাযোগ</p>
          <ul className="flex flex-col gap-[6px]">
            {kyc.emergencyContacts.map((contact) => (
              <li key={contact.phone} className="flex items-center justify-between gap-[8px] rounded-[10px] bg-surface px-[10px] py-[8px] text-[13px]">
                <span className="min-w-0 truncate font-semibold text-ink">
                  {contact.name} <span className="font-medium text-muted">({contact.relation})</span>
                </span>
                <a href={`tel:${contact.phone}`} className="shrink-0 font-semibold text-primary">{contact.phone}</a>
              </li>
            ))}
          </ul>

          {canReview && kyc.status === 'PENDING' && (
            <div className="mt-[14px]">
              <p className="mb-[6px] text-[13px] font-semibold text-ink">ফেরত পাঠালে কারণ (প্রোভাইডার দেখবে)</p>
              {/* One tap fills a common reason; it can still be edited or added to. */}
              <div className="mb-[8px] flex flex-wrap gap-[6px]">
                {REJECT_REASONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setReason((current) => (current.trim() ? `${current.trim()} ${preset}` : preset).slice(0, 300));
                      setNeedsReason(false);
                    }}
                    className="cursor-pointer rounded-full border border-chip px-[10px] py-[4px] text-[12px] font-semibold text-muted hover:border-secondary hover:bg-secondary hover:text-ink"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div className={`rounded-[10px] border bg-white px-[12px] py-[8px] ${needsReason ? 'border-[#d64545]' : 'border-line'}`}>
                <textarea
                  ref={reasonRef}
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    if (event.target.value.trim()) setNeedsReason(false);
                  }}
                  rows={2}
                  maxLength={300}
                  placeholder="কী ঠিক করতে হবে লিখুন"
                  className={`${fieldControlClass} resize-none`}
                />
              </div>
              {needsReason && <p className="mt-[4px] text-[12px] font-semibold text-[#d64545]">ফেরত পাঠাতে কারণ লিখুন বা উপরের একটি বেছে নিন।</p>}
              <div className="mt-[10px] flex gap-[8px]">
                <button
                  type="button"
                  disabled={review.isPending}
                  onClick={() => {
                    // Never a silent dead button: without a reason, say so and put the cursor in the box.
                    if (!reason.trim()) {
                      setNeedsReason(true);
                      reasonRef.current?.focus();
                      return;
                    }
                    review.mutate('REJECTED');
                  }}
                  className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ফেরত পাঠান
                </button>
                <button
                  type="button"
                  disabled={review.isPending}
                  onClick={() => review.mutate('APPROVED')}
                  className="h-[40px] flex-1 cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
                >
                  Approve
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
