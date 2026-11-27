'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { providerTermsService } from '@/services/provider-terms.service';
import { TermsText } from './TermsText';

const apiError = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/*
 * A verified provider who has not accepted the latest provider terms (the admin published new ones) sees them once,
 * on their next visit, and accepts them to carry on. It cannot be closed without accepting; the acceptance and its
 * version are recorded. Nobody else ever sees this (they accept the terms with their KYC).
 */
export function ProviderTermsGate({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['provider-terms-me', userId];
  const { data } = useQuery({ queryKey, queryFn: providerTermsService.mine, staleTime: 60_000 });
  const [hasAccepted, setHasAccepted] = useState(false);

  const accept = useMutation({
    mutationFn: () => providerTermsService.accept(data!.terms.version),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result);
      toast.success('নতুন শর্তাবলি মেনে নিয়েছেন। ধন্যবাদ।');
    },
    onError: (error) => {
      toast.error(apiError(error, 'মেনে নেওয়া যায়নি, আবার চেষ্টা করুন।'));
      // Most likely an even newer version: show it.
      setHasAccepted(false);
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  if (!data?.needsAcceptance) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-[16px]">
      <div role="dialog" aria-modal="true" aria-label={data.terms.title} className="flex max-h-[90vh] w-full max-w-[560px] flex-col rounded-[16px] bg-white text-ink shadow-xl">
        <div className="shrink-0 border-b border-line px-[20px] py-[14px]">
          <p className="text-[13px] font-semibold text-primary">শর্তাবলি হালনাগাদ হয়েছে</p>
          <p className="mt-[2px] text-[12px] font-medium text-muted">কাজ চালিয়ে যেতে নতুন শর্তগুলো পড়ে মেনে নিন।</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-[20px] py-[16px]">
          <TermsText terms={data.terms} />
          <label className="mt-[16px] flex cursor-pointer items-start gap-[10px] rounded-[12px] bg-surface p-[12px]">
            <input type="checkbox" checked={hasAccepted} onChange={(event) => setHasAccepted(event.target.checked)} className="mt-[2px] size-[18px] shrink-0 cursor-pointer accent-primary" />
            <span className="text-[13px] font-semibold leading-relaxed text-ink">আমি উপরের সব শর্ত পড়েছি, বুঝেছি এবং মেনে নিচ্ছি। আমার কাজ ও আচরণের সম্পূর্ণ দায়ভার আমার নিজের।</span>
          </label>
        </div>
        <div className="shrink-0 border-t border-line px-[20px] py-[14px]">
          <button
            type="button"
            disabled={!hasAccepted || accept.isPending}
            onClick={() => accept.mutate()}
            className="h-[40px] w-full cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {accept.isPending ? 'একটু অপেক্ষা...' : 'মেনে নিচ্ছি'}
          </button>
        </div>
      </div>
    </div>
  );
}
