'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { fieldControlClass } from '@/components/modals/place-order/OrderField';
import { ProviderTerms, providerTermsService } from '@/services/provider-terms.service';
import { ChipRow } from '../../ChipRow';
import { TermsText } from '../../kyc/TermsText';

/** A section while editing: its points as one line each. */
interface DraftSection {
  heading: string;
  pointsText: string;
}

type Mode = 'EDIT' | 'PREVIEW' | 'HISTORY';
const MODES = [
  { id: 'EDIT', label: 'এডিট' },
  { id: 'PREVIEW', label: 'প্রিভিউ' },
  { id: 'HISTORY', label: 'আগের সংস্করণ' },
] as const;

const toDraft = (terms: ProviderTerms): DraftSection[] => terms.sections.map((section) => ({ heading: section.heading, pointsText: section.points.join('\n') }));
const toSections = (draft: DraftSection[]) =>
  draft
    .map((section) => ({ heading: section.heading.trim(), points: section.pointsText.split('\n').map((line) => line.trim()).filter(Boolean) }))
    .filter((section) => section.heading && section.points.length > 0);
const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : 'শুরুর লেখা');

const apiError = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/*
 * Admin: the provider terms (conduct and liability). Edit a copy of the current text, see it as providers will, and
 * publish it as a new version. Versions are never changed or deleted, so what each provider accepted can always be
 * shown; publishing asks every verified provider to accept the new version on their next visit.
 */
export function ProviderTermsEditorPanel({ adminId, onClose }: { adminId: string; onClose: () => void }) {
  const queryKey = ['admin-provider-terms', adminId];
  const { data: versions, isLoading, isError } = useQuery({ queryKey, queryFn: providerTermsService.versions });

  return (
    <SidePanelShell title="প্রোভাইডারের শর্তাবলি" onClose={onClose}>
      {isLoading && <p className="text-[14px] font-medium text-muted">লোড হচ্ছে...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">শর্তাবলি আনা যায়নি।</p>}
      {/* Keyed by the newest version: after a publish the editor starts again from it. */}
      {versions && versions.length > 0 && <Editor key={versions[0].version} adminId={adminId} versions={versions} />}
    </SidePanelShell>
  );
}

function Editor({ adminId, versions }: { adminId: string; versions: ProviderTerms[] }) {
  const queryClient = useQueryClient();
  const current = versions[0];
  const [mode, setMode] = useState<Mode>('EDIT');
  const [title, setTitle] = useState(current.title);
  const [sections, setSections] = useState<DraftSection[]>(() => toDraft(current));
  const [isConfirming, setIsConfirming] = useState(false);
  const cleaned = toSections(sections);
  const isChanged = title.trim() !== current.title || JSON.stringify(cleaned) !== JSON.stringify(current.sections);
  const canPublish = isChanged && title.trim().length > 0 && cleaned.length > 0;

  const publish = useMutation({
    mutationFn: () => providerTermsService.publish({ title: title.trim(), sections: cleaned }),
    onSuccess: (published) => {
      toast.success(`সংস্করণ ${published.version} প্রকাশ হয়েছে। অনুমোদিত প্রোভাইডারদের পরের বার মেনে নিতে বলা হবে।`);
      setIsConfirming(false);
      void queryClient.invalidateQueries({ queryKey: ['admin-provider-terms', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['provider-terms-current'] });
    },
    onError: (error) => toast.error(apiError(error, 'প্রকাশ করা যায়নি।')),
  });

  const setSection = (index: number, change: Partial<DraftSection>) => setSections((list) => list.map((section, i) => (i === index ? { ...section, ...change } : section)));

  return (
    <div className="pb-[24px]">
      <p className="rounded-[12px] bg-surface p-[12px] text-[12px] font-medium leading-relaxed text-muted">
        এখন চালু আছে <span className="font-semibold text-ink">সংস্করণ {current.version}</span> ({formatDate(current.publishedAt)})। এখানে বদলে প্রকাশ করলে নতুন সংস্করণ হবে; আগেরগুলো মুছবে না, যাতে কে কোন লেখায় রাজি হয়েছিল সবসময় দেখানো যায়।
      </p>
      <ChipRow chips={MODES} activeId={mode} onSelect={setMode} label="Terms editor" rowClassName="px-0 py-[12px]" />

      {mode === 'EDIT' && (
        <>
          <div className="rounded-[10px] border border-line bg-white px-[12px] py-[8px]">
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="শিরোনাম" className={`${fieldControlClass} font-semibold`} />
          </div>
          {sections.map((section, index) => (
            <div key={index} className="mt-[12px] rounded-[12px] border border-line bg-white p-[12px]">
              <div className="flex items-center gap-[8px]">
                <input value={section.heading} onChange={(event) => setSection(index, { heading: event.target.value })} maxLength={200} placeholder="অংশের শিরোনাম" className={`${fieldControlClass} font-semibold`} />
                <button type="button" onClick={() => setSections((list) => list.filter((_, i) => i !== index))} aria-label="অংশ মুছুন" className="shrink-0 cursor-pointer text-muted hover:text-[#d64545]">
                  <HugeiconsIcon icon={Delete02Icon} size={18} />
                </button>
              </div>
              <textarea
                value={section.pointsText}
                onChange={(event) => setSection(index, { pointsText: event.target.value })}
                rows={Math.min(10, Math.max(3, section.pointsText.split('\n').length + 1))}
                placeholder="প্রতি লাইনে একটি পয়েন্ট"
                className={`${fieldControlClass} mt-[8px] w-full resize-y rounded-[8px] border border-line px-[10px] py-[8px] text-[13px] leading-relaxed`}
              />
            </div>
          ))}
          <button type="button" onClick={() => setSections((list) => [...list, { heading: '', pointsText: '' }])} className="mt-[12px] flex cursor-pointer items-center gap-[6px] text-[14px] font-semibold text-primary">
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.5} />
            নতুন অংশ যোগ করুন
          </button>
          <p className="mt-[8px] text-[12px] font-medium text-muted">প্রতিটি পয়েন্ট আলাদা লাইনে লিখুন। খালি অংশ বা খালি লাইন বাদ পড়বে।</p>
        </>
      )}

      {mode === 'PREVIEW' && <TermsText terms={{ title: title.trim() || '(শিরোনাম নেই)', sections: cleaned }} />}

      {mode === 'HISTORY' && (
        <ul className="flex flex-col gap-[12px]">
          {versions.map((version) => (
            <li key={version.version}>
              <details className="rounded-[12px] border border-line bg-white p-[12px]">
                <summary className="cursor-pointer text-[14px] font-semibold text-ink">
                  সংস্করণ {version.version} · {formatDate(version.publishedAt)} {version.version === current.version && <span className="text-primary">(চালু)</span>}
                </summary>
                <div className="mt-[10px]">
                  <TermsText terms={version} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {mode !== 'HISTORY' && (
        <div className="mt-[20px] rounded-[12px] border border-line bg-surface p-[12px]">
          {isConfirming ? (
            <>
              <p className="text-[13px] font-semibold text-ink">প্রকাশ করবেন?</p>
              <p className="mt-[4px] text-[12px] font-medium leading-relaxed text-muted">
                এটা সংস্করণ {current.version + 1} হবে। সব অনুমোদিত প্রোভাইডারকে পরের বার অ্যাপ খুললে নতুন শর্ত পড়ে মেনে নিতে বলা হবে; নতুন আবেদনকারীরা KYC জমার সময় এটাই দেখবে।
              </p>
              <div className="mt-[10px] flex gap-[8px]">
                <button type="button" disabled={publish.isPending} onClick={() => setIsConfirming(false)} className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface disabled:opacity-50">
                  থাক
                </button>
                <button type="button" disabled={publish.isPending} onClick={() => publish.mutate()} className="h-[40px] flex-1 cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:bg-primary-disabled">
                  {publish.isPending ? 'প্রকাশ হচ্ছে...' : 'হ্যাঁ, প্রকাশ করুন'}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              disabled={!canPublish}
              onClick={() => setIsConfirming(true)}
              className="h-[40px] w-full cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
            >
              নতুন সংস্করণ হিসেবে প্রকাশ করুন
            </button>
          )}
          {!isChanged && !isConfirming && <p className="mt-[6px] text-center text-[12px] font-medium text-muted">কিছু বদলালে তবেই প্রকাশ করা যাবে।</p>}
        </div>
      )}
    </div>
  );
}
