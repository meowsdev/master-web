'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogAdminService } from '@/services/catalog-admin.service';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, CheckmarkCircle02Icon, Delete02Icon, Layers01Icon, PlusSignIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { adminService } from '@/services/admin.service';
import { PicturePicker } from '../PicturePicker';
import { inputClass, lines, TabHeading } from './ServiceContentEditor';
import { useAdminCatalogStore } from '@/store/useAdminCatalogStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'The main service could not be created';
};

interface DraftFaq {
  question: string;
  answer: string;
}

/*
 * New main service (category), laid out like the profile form: the picture circle on top, then name and category,
 * then everything customers read on its right-hand panel (Overview, How to Order, Details, FAQ). Rating and reviews
 * fill in by themselves from the orders of all its packages.
 *
 * Saving makes the main service first, then its content. If a content save fails the main service still exists, and
 * its details panel opens so the rest can be added there.
 */
export function AdminCategoryPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const selectMainService = useAdminCatalogStore((state) => state.selectMainService);
  const openMainService = useCatalogPanelStore((state) => state.openMainService);
  const [name, setName] = useState('');
  const [picture, setPicture] = useState('');
  // The top-bar category it sits in; without one customers do not see it.
  const [groupId, setGroupId] = useState('');
  const [includedText, setIncludedText] = useState('');
  const [excludedText, setExcludedText] = useState('');
  const [howToOrderText, setHowToOrderText] = useState('');
  const [details, setDetails] = useState('');
  const [faqs, setFaqs] = useState<DraftFaq[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { data: groups = [] } = useQuery({ queryKey: ['admin-catalog-tree'], queryFn: catalogAdminService.tree });

  const isDraftFaqReady = Boolean(question.trim() && answer.trim());
  const addFaq = () => {
    if (!isDraftFaqReady) return;
    setFaqs((current) => [...current, { question: question.trim(), answer: answer.trim() }]);
    setQuestion('');
    setAnswer('');
  };

  const create = useMutation({
    mutationFn: async () => {
      const category = await adminService.createCategory({ name: name.trim(), iconUrl: picture.trim() || undefined, groupId: groupId || undefined });
      const failed: string[] = [];

      const content = {
        included: lines(includedText),
        excluded: lines(excludedText),
        howToOrder: lines(howToOrderText),
        details: details.trim(),
      };
      const hasContent = content.included.length > 0 || content.excluded.length > 0 || content.howToOrder.length > 0 || content.details.length > 0;
      if (hasContent) {
        try {
          await catalogAdminService.updateMainService(category.id, {
            ...(content.included.length ? { included: content.included } : {}),
            ...(content.excluded.length ? { excluded: content.excluded } : {}),
            ...(content.howToOrder.length ? { howToOrder: content.howToOrder } : {}),
            ...(content.details ? { details: content.details } : {}),
          });
        } catch {
          failed.push('Overview / How to Order / Details');
        }
      }

      // A question typed in but not yet added still counts.
      const allFaqs = isDraftFaqReady ? [...faqs, { question: question.trim(), answer: answer.trim() }] : faqs;
      for (const faq of allFaqs) {
        try {
          await catalogAdminService.createFaq({ categoryId: category.id, question: faq.question, answer: faq.answer });
        } catch {
          failed.push(`FAQ: ${faq.question}`);
        }
      }
      return { category, failed };
    },
    onSuccess: ({ category, failed }) => {
      ['admin-categories', 'order-catalog', 'admin-catalog-tree', 'super-app-services', 'admin-catalog-ungrouped', 'catalog-main-service'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      if (failed.length) toast.error(`${category.name} তৈরি হয়েছে, কিন্তু এগুলো save হয়নি: ${failed.join(', ')}। ডান পাশ থেকে আবার দিন।`);
      else toast.success(`${category.name} created. মাঝখানের "Add New Package" দিয়ে package যোগ করুন।`);
      // The new main service opens in the middle, with its details (Overview, FAQ, ...) on the right.
      selectMainService(category.id);
      onClose();
      openMainService(category.id);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <SidePanelShell title="New main service" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
        className="pb-[24px]"
      >
        <PicturePicker value={picture} onChange={setPicture} />

        <OrderField icon={Wrench01Icon}>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Main service name" className={fieldControlClass} />
        </OrderField>
        <OrderField icon={Layers01Icon}>
          <select value={groupId} onChange={(event) => setGroupId(event.target.value)} className={`${fieldControlClass} cursor-pointer appearance-none`}>
            <option value="">Category (top bar)</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </OrderField>

        <section className="mt-[28px] flex flex-col gap-[10px]">
          <TabHeading title="Overview" hint="কী কী কাজ থাকছে আর কী থাকছে না। প্রতি লাইনে একটা। এটা এর সব package-এ দেখাবে।" />
          <label className="flex flex-col gap-[4px]">
            <span className="flex items-center gap-[6px] text-[13px] font-semibold text-ink">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary" /> যা থাকছে (Included)
            </span>
            <textarea value={includedText} onChange={(event) => setIncludedText(event.target.value)} rows={3} placeholder={'যেমন:\nফিল্টার পরিষ্কার\nগ্যাস প্রেশার চেক'} className={inputClass} />
          </label>
          <label className="flex flex-col gap-[4px]">
            <span className="flex items-center gap-[6px] text-[13px] font-semibold text-ink">
              <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-[#d64545]" /> যা থাকছে না (Excluded)
            </span>
            <textarea value={excludedText} onChange={(event) => setExcludedText(event.target.value)} rows={2} placeholder={'যেমন:\nপার্টস-এর দাম'} className={inputClass} />
          </label>
        </section>

        <section className="mt-[24px] flex flex-col gap-[10px]">
          <TabHeading title="How to Order" hint="অর্ডার করার ধাপ, প্রতি লাইনে একটা (সর্বোচ্চ ১০টা)। খালি রাখলে অ্যাপের ডিফল্ট ৩ ধাপ দেখাবে।" />
          <textarea value={howToOrderText} onChange={(event) => setHowToOrderText(event.target.value)} rows={3} placeholder={'যেমন:\nসার্ভিস ও অপশন বাছুন\nঠিকানা ও সময় দিন\nঅর্ডার কনফার্ম করুন'} className={inputClass} />
        </section>

        <section className="mt-[24px] flex flex-col gap-[10px]">
          <TabHeading title="Details" hint="সার্ভিসের বিস্তারিত বর্ণনা। এটা এর সব package-এ দেখাবে।" />
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={5} maxLength={10000} placeholder="সার্ভিসটা কী, কীভাবে কাজ হয়, কত সময় লাগে..." className={inputClass} />
        </section>

        <section className="mt-[24px] flex flex-col gap-[10px]">
          <TabHeading title="FAQ" hint="প্রশ্ন-উত্তর। এগুলো এর সব package-এ দেখাবে।" />
          {faqs.map((faq, index) => (
            <div key={index} className="flex items-start gap-[8px] rounded-[8px] bg-surface p-[10px]">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink">{faq.question}</p>
                <p className="mt-[2px] whitespace-pre-line text-[13px] text-muted">{faq.answer}</p>
              </div>
              <button
                type="button"
                aria-label="Remove FAQ"
                onClick={() => setFaqs((current) => current.filter((_, at) => at !== index))}
                className="cursor-pointer rounded-full p-[4px] text-[#d64545] hover:bg-[#fdecec]"
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
              </button>
            </div>
          ))}
          <input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={300} placeholder="প্রশ্ন" className={inputClass} />
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={2} maxLength={5000} placeholder="উত্তর" className={inputClass} />
          <button
            type="button"
            onClick={addFaq}
            disabled={!isDraftFaqReady}
            className="flex h-[40px] cursor-pointer items-center justify-center gap-[6px] self-start rounded-[10px] border border-chip bg-white px-[14px] text-[14px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.2} /> Add FAQ
          </button>
        </section>

        <div className="mt-[28px] flex justify-center">
          <button
            type="submit"
            disabled={!name.trim() || !groupId || create.isPending}
            className="h-[40px] cursor-pointer rounded-[10px] bg-primary px-[20px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {create.isPending ? 'Creating...' : 'Create main service'}
          </button>
        </div>
      </form>
    </SidePanelShell>
  );
}
