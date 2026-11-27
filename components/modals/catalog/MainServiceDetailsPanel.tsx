'use client';

import { ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, CheckmarkCircle02Icon, PencilEdit01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { PublishToggle } from '@/components/super-app/admin/panels/PublishToggle';
import { MainServiceIdentityEditor } from '@/components/super-app/admin/panels/MainServiceIdentityEditor';
import { DetailsTab, FaqTab, HowToOrderTab, OverviewTab, useAction } from '@/components/super-app/admin/panels/ServiceContentEditor';
import { useAdminCatalog } from '@/components/super-app/admin/useAdminCatalog';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useReviewVisibility } from '@/hooks/useReviewVisibility';
import { catalogService } from '@/services/catalog.service';
import { catalogAdminService } from '@/services/catalog-admin.service';
import { CatalogMainServiceDetail, CatalogReviewPage } from '@/types/catalog.types';
import { ScheduleCta } from './ScheduleCta';
import { ChipRow } from '@/components/super-app/ChipRow';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'faq', label: 'FAQ' },
  { id: 'how-to-order', label: 'How to Order' },
  { id: 'review', label: 'Review' },
  { id: 'details', label: 'Details' },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];
type EditableId = Exclude<SectionId, 'review'>;

/*
 * Right-hand panel of a main service, opened with its chat: Overview, FAQ, How to Order, Review and Details.
 * Everyone sees the same panel; staff with service rights get a pencil on each part to change it in place.
 */
export function MainServiceDetailsPanel({ mainServiceId, onClose }: { mainServiceId: string; onClose: () => void }) {
  const { data, isLoading, isError, refetch } = useMainServiceView(mainServiceId);

  return (
    <SidePanelShell title={data?.name ?? 'Service details'} onClose={onClose} footer={<ScheduleCta mainServiceId={mainServiceId} />}>
      {isLoading ? (
        <div className="animate-pulse space-y-[16px]">
          <div className="h-[24px] w-2/3 rounded bg-surface" />
          <div className="h-[160px] rounded-[12px] bg-surface" />
          <div className="h-[160px] rounded-[12px] bg-surface" />
        </div>
      ) : isError || !data ? (
        <div className="py-[40px] text-center">
          <p className="text-[14px] text-muted">তথ্য লোড হয়নি।</p>
          <button type="button" onClick={() => refetch()} className="mt-[8px] cursor-pointer font-semibold text-primary underline">আবার চেষ্টা করুন</button>
        </div>
      ) : (
        <MainServiceInfo key={data.id} data={data} />
      )}
    </SidePanelShell>
  );
}

/** A main service as the panels show it: the customer read, or for staff the full catalog when it is unpublished. */
export function useMainServiceView(mainServiceId: string) {
  const { canManageServices: canEdit } = useStaffPermissions();
  const customerRead = useQuery({
    queryKey: ['catalog-main-service', mainServiceId],
    queryFn: () => catalogService.getMainService(mainServiceId),
    staleTime: 30_000,
    retry: canEdit ? false : 3,
  });
  // An unpublished main service is not in the customer read; staff still see it, built from the full catalog.
  const { mains } = useAdminCatalog({ enabled: canEdit });
  const stored = mains.find((main) => main.id === mainServiceId);
  const data: CatalogMainServiceDetail | undefined =
    customerRead.data ??
    (canEdit && stored
      ? {
          id: stored.id,
          name: stored.name,
          slug: stored.id,
          description: stored.description,
          iconUrl: stored.iconUrl,
          groupId: stored.groupId,
          group: stored.group,
          services: [],
          included: stored.included,
          excluded: stored.excluded,
          howToOrder: stored.howToOrder,
          details: stored.details,
          faqs: stored.faqs,
        }
      : undefined);
  const isLoading = (customerRead.isLoading || (canEdit && !stored && customerRead.isError)) && !data;
  return { data, isLoading, isError: !isLoading && !data, refetch: customerRead.refetch };
}

/*
 * Overview, FAQ, How to Order, Review and Details of a main service. On its own panel it opens with the service's
 * name, rating and (for staff) publish and category; inside a package's panel (embedded) it follows that package.
 */
export function MainServiceInfo({ data, embedded = false }: { data: CatalogMainServiceDetail; embedded?: boolean }) {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [editing, setEditing] = useState<EditableId | null>(null);
  // Staff: the name / description / picture editor, opened by the pencil beside the name.
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const { canManageServices: canEdit } = useStaffPermissions();
  // Staff edit the stored values (the public read fills an empty How to order with the standard steps).
  const { mains } = useAdminCatalog({ enabled: canEdit });
  const stored = mains.find((main) => main.id === data.id);
  const publish = useAction((isActive: boolean) => catalogAdminService.updateMainService(data.id, { isActive }), 'Saved');

  const jumpTo = (id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`main-service-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const editButton = (id: EditableId) =>
    canEdit && stored ? (
      <button
        type="button"
        onClick={() => setEditing((current) => (current === id ? null : id))}
        className="flex cursor-pointer items-center gap-[4px] rounded-full px-[10px] py-[4px] text-[13px] font-semibold text-primary transition-colors hover:bg-secondary"
      >
        {editing === id ? (
          'Done'
        ) : (
          <>
            <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.8} /> Edit
          </>
        )}
      </button>
    ) : null;

  return (
    <div className="flex flex-col gap-[20px] pb-[16px]">
      <div>
        {/* Who the service is: its category, picture, name and how customers rate it, with room to breathe. */}
        <div className={`rounded-[16px] border border-line bg-white ${embedded ? 'p-[14px]' : 'p-[16px]'}`}>
          {data.group && (
            <span className="inline-flex items-center rounded-full bg-secondary/60 px-[10px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.6px] text-ink">
              {embedded ? 'Service সম্পর্কে' : data.group.name}
            </span>
          )}
          <div className={`flex items-center gap-[12px] ${data.group ? 'mt-[12px]' : ''}`}>
            {!embedded && <ServicePicture source={data.iconUrl ?? null} />}
            <h2 className={`min-w-0 flex-1 font-semibold leading-[1.25] text-ink ${embedded ? 'text-[18px] tracking-[-0.36px]' : 'text-[22px] tracking-[-0.44px]'}`}>{data.name}</h2>
            {/* Staff: publish / unpublish and the pencil that opens the editor, right beside the name. */}
            {canEdit && stored && !embedded && (
              <div className="flex shrink-0 items-center gap-[6px]">
                <PublishToggle isPublished={stored.isActive} onChange={(isActive) => publish.mutate(isActive)} />
                <button
                  type="button"
                  onClick={() => setIsEditingIdentity((isOpen) => !isOpen)}
                  aria-label="নাম, বিবরণ ও আইকন এডিট"
                  aria-expanded={isEditingIdentity}
                  title="নাম, বিবরণ ও আইকন এডিট"
                  className={`flex size-[32px] cursor-pointer items-center justify-center rounded-full transition-colors ${isEditingIdentity ? 'bg-secondary text-ink' : 'text-primary hover:bg-secondary'}`}
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} size={18} strokeWidth={1.8} />
                </button>
              </div>
            )}
          </div>
          <div className="mt-[12px] flex flex-wrap items-center gap-[8px] text-[13px]">
            <span className="inline-flex items-center gap-[4px] rounded-full bg-surface px-[10px] py-[4px] font-bold text-ink">
              <HugeiconsIcon icon={StarIcon} size={15} className="fill-[#f5a524] text-[#f5a524]" />
              {data.rating?.average != null ? data.rating.average.toFixed(2) : 'New'}
            </span>
            {(data.servedCount ?? 0) > 0 && (
              <span className="inline-flex items-center rounded-full bg-surface px-[10px] py-[4px] font-semibold text-ink">{data.servedCount}+ served</span>
            )}
            <span className="inline-flex items-center rounded-full bg-surface px-[10px] py-[4px] font-medium text-muted">
              {data.rating?.count ?? 0} reviews{data.services.length ? ` · ${data.services.length} services` : ''}
            </span>
          </div>
        </div>

        {canEdit && stored && !embedded && isEditingIdentity && (
          <div className="mt-[12px]">
            <MainServiceIdentityEditor main={stored} onClose={() => setIsEditingIdentity(false)} />
          </div>
        )}
      </div>

      {/* Same chips as the sidebar filters; stays on top while the sections scroll by. */}
      <div className="sticky top-[-20px] z-10 -mx-[20px] bg-white">
        <ChipRow label="service information" chips={SECTIONS} activeId={activeSection} onSelect={jumpTo} rowClassName="px-[20px] py-[10px]" />
      </div>

      <Section id="overview" title={`Overview of ${data.name}`} action={editButton('overview')}>
        {editing === 'overview' && stored ? (
          <OverviewTab kind="main" id={data.id} included={stored.included} excluded={stored.excluded} />
        ) : (
          <>
            <Checklist title="What's included?" items={data.included} isIncluded />
            <Checklist title="What's excluded?" items={data.excluded} isIncluded={false} />
            {data.included.length === 0 && data.excluded.length === 0 && <Empty text="এখনো কোনো তথ্য যোগ হয়নি।" />}
          </>
        )}
      </Section>

      <Section id="faq" title="FAQ" action={editButton('faq')}>
        {editing === 'faq' && stored ? (
          <FaqTab kind="main" faqs={stored.faqs} owner={{ categoryId: data.id }} />
        ) : data.faqs.length === 0 ? (
          <Empty text="এখনো কোনো প্রশ্ন যোগ হয়নি।" />
        ) : (
          <div className="divide-y divide-line rounded-[12px] border border-line">
            {data.faqs.map((faq) => (
              <details key={faq.id} className="group px-[14px] py-[12px]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-[12px] text-[14px] font-semibold text-ink">
                  {faq.questionBn || faq.question}
                  <span className="shrink-0 text-[18px] leading-none text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-[8px] text-[14px] leading-relaxed text-ink">{faq.answerBn || faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </Section>

      <Section id="how-to-order" title="How to order" action={editButton('how-to-order')}>
        {editing === 'how-to-order' && stored ? (
          <HowToOrderTab id={data.id} steps={stored.howToOrder} />
        ) : (
          <ol className="flex flex-col gap-[12px]">
            {data.howToOrder.map((step, index) => {
              const [head, ...rest] = step.split(':');
              return (
                <li key={`${index}-${step}`} className="flex gap-[12px]">
                  <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">{index + 1}</span>
                  <p className="pt-[3px] text-[14px] leading-relaxed text-ink">
                    {rest.length ? (
                      <>
                        <span className="font-semibold text-ink">{head}</span>
                        {':' + rest.join(':')}
                      </>
                    ) : (
                      step
                    )}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </Section>

      <Section id="review" title={`Review of ${data.name}`}>
        <Reviews mainServiceId={data.id} />
      </Section>

      <Section id="details" title="Details" action={editButton('details')}>
        {editing === 'details' && stored ? (
          <DetailsTab kind="main" id={data.id} details={stored.details ?? ''} />
        ) : data.details ? (
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{data.details}</p>
        ) : (
          <Empty text="এখনো বিস্তারিত যোগ হয়নি।" />
        )}
      </Section>
    </div>
  );
}

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

/* The main service's round picture: an uploaded image or Hugeicons icon link, or an old emoji. */
function ServicePicture({ source }: { source: string | null }) {
  return (
    <span className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[24px]">
      {source && isImageSource(source) ? (
        // eslint-disable-next-line @next/next/no-img-element -- pictures come from arbitrary upload hosts
        <img src={source} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{source || '🛠️'}</span>
      )}
    </span>
  );
}

function Reviews({ mainServiceId }: { mainServiceId: string }) {
  const { canModerateReviews } = useStaffPermissions();
  const visibility = useReviewVisibility();
  const { data: first, isLoading } = useQuery({
    queryKey: ['catalog-main-service-reviews', mainServiceId],
    queryFn: () => catalogService.getMainServiceReviews(mainServiceId, 1),
    staleTime: 60_000,
  });
  const [more, setMore] = useState<CatalogReviewPage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  if (isLoading) return <div className="h-[80px] animate-pulse rounded-[12px] bg-surface" />;
  if (!first || first.summary.count === 0) return <Empty text="এখনো কোনো রিভিউ নেই। প্রথম অর্ডারের পর এখানে দেখা যাবে।" />;

  const { summary } = first;
  const items = [first, ...more].flatMap((page) => page.items);
  const hasMore = items.length < summary.count;

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const page = await catalogService.getMainServiceReviews(mainServiceId, more.length + 2);
      setMore((previous) => [...previous, page]);
    } catch {
      toast.error('আরো রিভিউ লোড হয়নি');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center gap-[20px] rounded-[12px] bg-surface p-[14px]">
        <div className="text-center">
          <p className="text-[32px] font-bold leading-none text-ink">{summary.average?.toFixed(2)}</p>
          <p className="mt-[4px] text-[14px] text-[#f5a524]">{'★'.repeat(Math.round(summary.average ?? 0))}</p>
          <p className="text-[12px] text-muted">{summary.count} reviews</p>
        </div>
        <div className="flex flex-1 flex-col gap-[4px]">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.breakdown[star - 1];
            return (
              <div key={star} className="flex items-center gap-[8px] text-[12px] text-muted">
                <span className="w-[10px]">{star}</span>
                <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-[#f5a524]" style={{ width: `${summary.count ? (count / summary.count) * 100 : 0}%` }} />
                </div>
                <span className="w-[24px] text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <ul className="flex flex-col gap-[10px]">
        {items.map((review) => (
          <li key={review.id} className="border-b border-line pb-[10px]">
            <div className="flex items-center justify-between gap-[8px]">
              <p className="text-[14px] font-semibold text-ink">{review.reviewerName}</p>
              <p className="text-[13px] text-[#f5a524]" aria-label={`${review.rating} out of 5`}>
                {'★'.repeat(review.rating)}
                <span className="text-muted">{'★'.repeat(Math.max(0, 5 - review.rating))}</span>
              </p>
            </div>
            <p className="text-[12px] text-muted">Taken on {new Date(review.takenOn ?? review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {review.comment && <p className="mt-[4px] text-[14px] text-ink">{review.comment}</p>}
            {/* Admin: take it off the page (the provider's details panel can show it again). */}
            {canModerateReviews && (
              <button
                type="button"
                disabled={visibility.busyReviewId === review.id}
                onClick={() => {
                  visibility.toggle(review.id, false);
                  setMore((pages) => pages.map((page) => ({ ...page, items: page.items.filter((item) => item.id !== review.id) })));
                }}
                className="mt-[6px] cursor-pointer text-[12px] font-semibold text-[#d64545] hover:underline disabled:opacity-50"
              >
                এই রিভিউ লুকান
              </button>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button type="button" onClick={loadMore} disabled={isLoadingMore} className="cursor-pointer self-start text-[14px] font-semibold text-primary underline disabled:opacity-50">
          {isLoadingMore ? 'Loading...' : 'View more reviews'}
        </button>
      )}
    </div>
  );
}

function Section({ id, title, action, children }: { id: SectionId; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section id={`main-service-section-${id}`} className="scroll-mt-[60px] rounded-[12px] border border-line p-[16px]">
      <div className="mb-[12px] flex items-center justify-between gap-[8px]">
        <h3 className="text-[18px] font-semibold text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Checklist({ title, items, isIncluded }: { title: string; items: string[]; isIncluded: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-[12px]">
      <p className="mb-[6px] text-[15px] font-semibold text-ink">{title}</p>
      <ul className="flex flex-col gap-[6px]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-[8px] text-[14px] text-ink">
            <HugeiconsIcon icon={isIncluded ? CheckmarkCircle02Icon : Cancel01Icon} size={18} className={`mt-[1px] shrink-0 ${isIncluded ? 'text-primary' : 'text-[#d64545]'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const Empty = ({ text }: { text: string }) => <p className="text-[14px] text-muted">{text}</p>;
