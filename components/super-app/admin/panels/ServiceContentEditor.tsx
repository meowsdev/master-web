'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, CheckmarkCircle02Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { orderErrorMessage } from '@/hooks/useOrderPlaceFields';
import { AdminFaq, catalogAdminService } from '@/services/catalog-admin.service';
import { ChipRow } from '@/components/super-app/ChipRow';

export const inputClass = 'w-full rounded-[8px] border border-line bg-white px-[10px] py-[8px] text-[14px] text-ink outline-none placeholder:text-muted focus:border-primary';
export const smallButton = 'cursor-pointer rounded-[8px] px-[12px] py-[7px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50';
const primaryButton = `${smallButton} self-start bg-primary text-white hover:bg-primary/90`;
export const lines = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean);

/** Every catalog read the customer app caches; refreshed after each admin change so edits show at once. */
function useRefreshCatalog() {
  const queryClient = useQueryClient();
  return () => {
    ['admin-catalog-tree', 'admin-catalog-ungrouped', 'catalog-groups', 'super-app-services', 'catalog-main-service', 'catalog-sub-service', 'catalog-main-services-all', 'admin-services'].forEach((key) =>
      queryClient.invalidateQueries({ queryKey: [key] }),
    );
  };
}

export function useAction<T>(action: (input: T) => Promise<unknown>, success?: string) {
  const refresh = useRefreshCatalog();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      if (success) toast.success(success);
      refresh();
    },
    onError: (error) => toast.error(orderErrorMessage(error, 'Could not save')),
  });
}

type TabId = 'overview' | 'faq' | 'how-to-order' | 'details';

// Same order and names as the tab row the customer sees.
const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'faq', label: 'FAQ' },
  { id: 'how-to-order', label: 'How to order' },
  { id: 'details', label: 'Details' },
];

interface ServiceContentEditorProps {
  /** A main service's content is the fallback for all its sub-services; How to order lives only on the main service. */
  kind: 'main' | 'sub';
  id: string;
  initial: { included: string[]; excluded: string[]; details: string; howToOrder?: string[] };
  faqs: AdminFaq[];
}

/* The four customer tabs of a service, each edited and saved on its own. */
export function ServiceContentEditor({ kind, id, initial, faqs }: ServiceContentEditorProps) {
  const [tab, setTab] = useState<TabId>('overview');
  return (
    <div className="flex flex-col gap-[12px]">
      <ChipRow
        label="content tabs"
        chips={TABS.map((item) => ({ id: item.id, label: item.id === 'faq' && faqs.length > 0 ? `${item.label} (${faqs.length})` : item.label }))}
        activeId={tab}
        onSelect={setTab}
        rowClassName="py-[2px]"
      />

      <div className="rounded-[12px] border border-line bg-white p-[12px]">
        {tab === 'overview' && <OverviewTab key={id} kind={kind} id={id} included={initial.included} excluded={initial.excluded} />}
        {tab === 'faq' && <FaqTab faqs={faqs} owner={kind === 'main' ? { categoryId: id } : { serviceId: id }} kind={kind} />}
        {tab === 'how-to-order' && (kind === 'main' ? <HowToOrderTab key={id} id={id} steps={initial.howToOrder ?? []} /> : <SubHowToOrderNote />)}
        {tab === 'details' && <DetailsTab key={id} kind={kind} id={id} details={initial.details} />}
      </div>
    </div>
  );
}

export function TabHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-[10px]">
      <p className="border-l-[3px] border-primary pl-[8px] text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-[4px] text-[12px] text-muted">{hint}</p>
    </div>
  );
}

const fallbackHint = (kind: 'main' | 'sub') => (kind === 'sub' ? ' শুধু এই package-এ, option-গুলোর নিচে দেখাবে।' : ' এটা এর সব sub-service-এ দেখাবে।');

function save(kind: 'main' | 'sub', id: string, body: { included?: string[]; excluded?: string[]; details?: string; howToOrder?: string[] }) {
  return kind === 'main' ? catalogAdminService.updateMainService(id, body) : catalogAdminService.updateSubService(id, body);
}

export function OverviewTab({ kind, id, included, excluded }: { kind: 'main' | 'sub'; id: string; included: string[]; excluded: string[] }) {
  const [inText, setInText] = useState(included.join('\n'));
  const [outText, setOutText] = useState(excluded.join('\n'));
  const action = useAction(() => save(kind, id, { included: lines(inText), excluded: lines(outText) }), 'Overview saved');
  return (
    <div className="flex flex-col gap-[10px]">
      <TabHeading title="Overview" hint={`কী কী কাজ থাকছে আর কী থাকছে না। প্রতি লাইনে একটা।${fallbackHint(kind)}`} />
      <label className="flex flex-col gap-[4px]">
        <span className="flex items-center gap-[6px] text-[13px] font-semibold text-ink">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary" /> যা থাকছে (Included)
        </span>
        <textarea value={inText} onChange={(event) => setInText(event.target.value)} rows={4} placeholder={'যেমন:\nফিল্টার পরিষ্কার\nগ্যাস প্রেশার চেক'} className={inputClass} />
      </label>
      <label className="flex flex-col gap-[4px]">
        <span className="flex items-center gap-[6px] text-[13px] font-semibold text-ink">
          <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-[#d64545]" /> যা থাকছে না (Excluded)
        </span>
        <textarea value={outText} onChange={(event) => setOutText(event.target.value)} rows={3} placeholder={'যেমন:\nপার্টস-এর দাম'} className={inputClass} />
      </label>
      <button type="button" onClick={() => action.mutate(undefined)} disabled={action.isPending} className={primaryButton}>
        {action.isPending ? 'Saving...' : 'Save Overview'}
      </button>
    </div>
  );
}

export function HowToOrderTab({ id, steps }: { id: string; steps: string[] }) {
  const [text, setText] = useState(steps.join('\n'));
  const action = useAction(() => save('main', id, { howToOrder: lines(text) }), 'How to order saved');
  const preview = lines(text);
  return (
    <div className="flex flex-col gap-[10px]">
      <TabHeading title="How to order" hint="অর্ডার করার ধাপ, প্রতি লাইনে একটা। খালি রাখলে অ্যাপের ডিফল্ট ৩ ধাপ দেখাবে।" />
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder={'যেমন:\nসার্ভিস ও অপশন বাছুন\nঠিকানা ও সময় দিন\nঅর্ডার কনফার্ম করুন'} className={inputClass} />
      {preview.length > 0 && (
        <ol className="flex flex-col gap-[6px]">
          {preview.map((step, index) => (
            <li key={index} className="flex items-center gap-[8px] text-[13px] text-ink">
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
      <button type="button" onClick={() => action.mutate(undefined)} disabled={action.isPending} className={primaryButton}>
        {action.isPending ? 'Saving...' : 'Save How to order'}
      </button>
    </div>
  );
}

function SubHowToOrderNote() {
  return (
    <div>
      <TabHeading title="How to order" hint="How to order পুরো main service-এর জন্য একটাই। এটা বদলাতে main service-এর How to order tab-এ যান।" />
    </div>
  );
}

export function DetailsTab({ kind, id, details }: { kind: 'main' | 'sub'; id: string; details: string }) {
  const [text, setText] = useState(details);
  const action = useAction(() => save(kind, id, { details: text.trim() }), 'Details saved');
  return (
    <div className="flex flex-col gap-[10px]">
      <TabHeading title="Details" hint={`সার্ভিসের বিস্তারিত বর্ণনা।${fallbackHint(kind)}`} />
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={6} placeholder="সার্ভিসটা কী, কীভাবে কাজ হয়, কত সময় লাগে..." className={inputClass} />
      <button type="button" onClick={() => action.mutate(undefined)} disabled={action.isPending} className={primaryButton}>
        {action.isPending ? 'Saving...' : 'Save Details'}
      </button>
    </div>
  );
}

export function FaqTab({ faqs, owner, kind }: { faqs: Array<Pick<AdminFaq, 'id' | 'question' | 'answer'>>; owner: { categoryId?: string; serviceId?: string }; kind: 'main' | 'sub' }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const create = useAction(() => catalogAdminService.createFaq({ ...owner, question: question.trim(), answer: answer.trim() }), 'FAQ added');
  const remove = useAction((faqId: string) => catalogAdminService.deleteFaq(faqId), 'FAQ removed');

  return (
    <div className="flex flex-col gap-[10px]">
      <TabHeading title="FAQ" hint={kind === 'sub' ? 'এই সার্ভিসের প্রশ্ন-উত্তর। এগুলো main service-এর FAQ-এর আগে দেখাবে।' : 'প্রশ্ন-উত্তর। এগুলো এর সব sub-service-এ দেখাবে।'} />
      {faqs.length === 0 && <p className="rounded-[8px] bg-surface p-[10px] text-center text-[13px] text-muted">এখনো কোনো FAQ নেই</p>}
      <ul className="flex flex-col gap-[6px]">
        {faqs.map((faq) => (
          <li key={faq.id} className="flex items-start gap-[6px] rounded-[8px] bg-surface p-[8px] text-[13px]">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">প্র: {faq.question}</p>
              <p className="mt-[2px] text-muted">উ: {faq.answer}</p>
            </div>
            <button type="button" aria-label="Delete FAQ" onClick={() => remove.mutate(faq.id)} className="cursor-pointer rounded-full p-[4px] text-[#d64545] hover:bg-[#fdecec]">
              <HugeiconsIcon icon={Delete02Icon} size={15} />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex flex-col gap-[6px] border-t border-line pt-[10px]"
        onSubmit={(event) => {
          event.preventDefault();
          if (question.trim() && answer.trim())
            create.mutate(undefined, {
              onSuccess: () => {
                setQuestion('');
                setAnswer('');
              },
            });
        }}
      >
        <span className="text-[13px] font-semibold text-ink">নতুন FAQ</span>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={300} placeholder="প্রশ্ন" className={inputClass} />
        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={2} maxLength={5000} placeholder="উত্তর" className={inputClass} />
        <button type="submit" disabled={!question.trim() || !answer.trim() || create.isPending} className={primaryButton}>
          Add FAQ
        </button>
      </form>
    </div>
  );
}
