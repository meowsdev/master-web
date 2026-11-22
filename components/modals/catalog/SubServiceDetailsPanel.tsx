'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Cancel01Icon, MinusSignIcon, PlusSignIcon, StarIcon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { catalogService } from '@/services/catalog.service';
import { useCartStore } from '@/store/useCartStore';
import { CatalogReviewPage, CatalogSubServiceDetail, CatalogVariant } from '@/types/catalog.types';

interface SubServiceDetailsPanelProps {
  mainServiceId: string;
  subServiceId: string;
  onClose: () => void;
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'faq', label: 'FAQ' },
  { id: 'how-to-order', label: 'How to Order' },
  { id: 'review', label: 'Review' },
  { id: 'details', label: 'Details' },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

/** Most a single option can be ordered at once, by how it is priced (the backend enforces the same limits). */
const MAX_QUANTITY = { FIXED: 1, PER_UNIT: 10, PER_SQFT: 10_000 } as const;
const isImageSource = (value?: string | null) => Boolean(value && /^(https?:)?\/\/|^\//.test(value));

/*
 * Right-hand details of one sub-service (opened from its card in the Services tab): the options with price, old
 * price, quantity and Add; then Overview, FAQ, How to Order, Review and Details, reachable from the tab row.
 */
export function SubServiceDetailsPanel({ mainServiceId, subServiceId, onClose }: SubServiceDetailsPanelProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalog-sub-service', subServiceId],
    queryFn: () => catalogService.getSubService(subServiceId),
    staleTime: 30_000,
  });

  return (
    <SidePanelShell title={data?.name ?? 'Service details'} onClose={onClose}>
      {isLoading ? (
        <div className="animate-pulse space-y-[16px]">
          <div className="aspect-[2/1] rounded-[12px] bg-[#ececec]" />
          <div className="h-[24px] w-2/3 rounded bg-[#ececec]" />
          <div className="h-[120px] rounded-[12px] bg-[#ececec]" />
        </div>
      ) : isError || !data ? (
        <div className="py-[40px] text-center">
          <p className="text-[14px] text-[#697586]">তথ্য লোড হয়নি।</p>
          <button type="button" onClick={() => refetch()} className="mt-[8px] cursor-pointer font-semibold text-[#1daa61] underline">আবার চেষ্টা করুন</button>
        </div>
      ) : (
        <Details key={data.id} data={data} mainServiceId={mainServiceId} />
      )}
    </SidePanelShell>
  );
}

function Details({ data, mainServiceId }: { data: CatalogSubServiceDetail; mainServiceId: string }) {
  // Sections are found by DOM id: the tab row scrolls the panel to them.
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const reviewCount = data.reviews.summary.count;

  const jumpTo = (id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`service-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col gap-[20px] pb-[16px]">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-[12px] bg-gradient-to-b from-[#d7fdd2] to-[#f7f5f3]">
        {isImageSource(data.imageUrl) ? (
          <Image src={data.imageUrl!} alt={data.name} fill sizes="530px" unoptimized className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-[64px]" aria-hidden>🛠️</span>
        )}
      </div>

      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#1daa61]">{data.mainService.name}</p>
        <h2 className="border-l-[4px] border-[#1daa61] pl-[12px] text-[22px] font-semibold leading-tight tracking-[-0.44px] text-[#202939]">{data.nameBn || data.name}</h2>
        <div className="mt-[6px] flex flex-wrap items-center gap-x-[8px] text-[14px] text-[#364152]">
          <span className="flex items-center gap-[4px] font-bold">
            <HugeiconsIcon icon={StarIcon} size={16} className="fill-[#f5a623] text-[#f5a623]" />
            {data.reviews.summary.average != null ? data.reviews.summary.average.toFixed(2) : 'New'}
          </span>
          {data.servedCount > 0 && <span>• {data.servedCount}+ served</span>}
          {reviewCount > 0 && <span className="text-[#697586]">({reviewCount} reviews)</span>}
        </div>
        {data.description && <p className="mt-[8px] text-[14px] leading-relaxed text-[#364152]">{data.description}</p>}
      </div>

      <section aria-label="Options">
        <h3 className="mb-[10px] text-[16px] font-semibold text-[#202939]">
          {data.name} <span className="text-[13px] font-normal text-[#697586]">({data.variants.length} {data.variants.length === 1 ? 'option' : 'options'} available)</span>
        </h3>
        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
          {data.variants.map((variant) => (
            <VariantCard key={variant.id ?? variant.name} variant={variant} subService={data} mainServiceId={mainServiceId} />
          ))}
        </div>
      </section>

      <nav aria-label="Service information" className="no-scrollbar sticky top-[-20px] z-10 -mx-[20px] flex gap-[8px] overflow-x-auto bg-white px-[20px] py-[10px]">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => jumpTo(section.id)}
            className={`shrink-0 cursor-pointer rounded-full border px-[14px] py-[6px] text-[13px] font-semibold transition-colors ${
              activeSection === section.id ? 'border-[#1daa61] bg-[#e7fce3] text-[#15803d]' : 'border-[#e5e5e5] bg-[#f7f5f3] text-[#364152] hover:bg-[#efefef]'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <Section id="overview" title={`Overview of ${data.name}`}>
        <Checklist title="What's included?" items={data.overview.included} isIncluded />
        <Checklist title="What's excluded?" items={data.overview.excluded} isIncluded={false} />
        {data.overview.included.length === 0 && data.overview.excluded.length === 0 && <Empty text="এখনো কোনো তথ্য যোগ হয়নি।" />}
      </Section>

      <Section id="faq" title="FAQ">
        {data.faqs.length === 0 ? (
          <Empty text="এখনো কোনো প্রশ্ন যোগ হয়নি।" />
        ) : (
          <div className="divide-y divide-[#e5e5e5] rounded-[12px] border border-[#e5e5e5]">
            {data.faqs.map((faq) => (
              <details key={faq.id} className="group px-[14px] py-[12px]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-[12px] text-[14px] font-semibold text-[#202939]">
                  {faq.questionBn || faq.question}
                  <span className="shrink-0 text-[18px] leading-none text-[#697586] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-[8px] text-[14px] leading-relaxed text-[#364152]">{faq.answerBn || faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </Section>

      <Section id="how-to-order" title="How to order">
        <ol className="flex flex-col gap-[12px]">
          {data.howToOrder.map((step, index) => {
            const [head, ...rest] = step.split(':');
            return (
              <li key={step} className="flex gap-[12px]">
                <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-[#1daa61] text-[13px] font-bold text-white">{index + 1}</span>
                <p className="pt-[3px] text-[14px] leading-relaxed text-[#364152]">
                  {rest.length ? (
                    <>
                      <span className="font-semibold text-[#202939]">{head}</span>
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
      </Section>

      <Section id="review" title={`Review of ${data.name}`}>
        <Reviews subServiceId={data.id} first={data.reviews} />
      </Section>

      <Section id="details" title="Details">
        {data.details ? <p className="whitespace-pre-line text-[14px] leading-relaxed text-[#364152]">{data.details}</p> : <Empty text="এখনো বিস্তারিত যোগ হয়নি।" />}
        {data.features.length > 0 && (
          <ul className="mt-[10px] list-disc space-y-[4px] pl-[20px] text-[14px] text-[#364152]">
            {data.features.map((feature, index) => (
              <li key={`${index}-${feature}`}>{feature}</li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function VariantCard({ variant, subService, mainServiceId }: { variant: CatalogVariant; subService: CatalogSubServiceDetail; mainServiceId: string }) {
  const addToCart = useCartStore((state) => state.add);
  const inCart = useCartStore((state) => state.carts[mainServiceId]?.find((line) => line.variantId === variant.id));
  const [quantity, setQuantity] = useState(1);
  const isCountable = variant.priceUnit !== 'FIXED';
  const max = MAX_QUANTITY[variant.priceUnit] ?? 1;
  const price = Number(variant.price);
  const original = variant.originalPrice != null ? Number(variant.originalPrice) : null;
  const unitLabel = variant.priceUnit === 'PER_SQFT' ? '/ sqft' : variant.priceUnit === 'PER_UNIT' ? '/ per' : '';

  const add = () => {
    if (!variant.id) {
      toast.error('এই সার্ভিসের দাম এখনো ঠিক হয়নি। Custom দিয়ে অর্ডার করুন।');
      return;
    }
    addToCart(mainServiceId, {
      variantId: variant.id,
      subServiceId: subService.id,
      subServiceName: subService.name,
      variantName: variant.name,
      unitPrice: price,
      priceUnit: variant.priceUnit,
      quantity: isCountable ? quantity : 1,
      imageUrl: variant.imageUrl ?? subService.imageUrl ?? null,
    });
    toast.success(`${subService.name} (${variant.name}) কার্টে যোগ হয়েছে`);
  };

  return (
    <div className={`overflow-hidden rounded-[12px] border bg-white ${inCart ? 'border-[#1daa61]' : 'border-[#e5e5e5]'}`}>
      <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-[#d7fdd2] to-[#f7f5f3]">
        {isImageSource(variant.imageUrl ?? subService.imageUrl) ? (
          <Image src={(variant.imageUrl ?? subService.imageUrl)!} alt="" fill sizes="260px" unoptimized className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-[36px]" aria-hidden>🛠️</span>
        )}
        <div className="absolute inset-x-[8px] bottom-[8px] flex items-center justify-between gap-[6px]">
          {isCountable ? (
            <div className="flex items-center gap-[2px] rounded-full bg-white px-[6px] py-[4px] shadow-sm">
              <button type="button" aria-label="Fewer" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex size-[22px] cursor-pointer items-center justify-center rounded-full hover:bg-[#f0f0f0]">
                <HugeiconsIcon icon={MinusSignIcon} size={14} />
              </button>
              <span className="min-w-[20px] text-center text-[13px] font-semibold">{quantity}</span>
              <button type="button" aria-label="More" onClick={() => setQuantity((value) => Math.min(max, value + 1))} className="flex size-[22px] cursor-pointer items-center justify-center rounded-full hover:bg-[#f0f0f0]">
                <HugeiconsIcon icon={PlusSignIcon} size={14} />
              </button>
            </div>
          ) : (
            <span />
          )}
          <button type="button" onClick={add} className="cursor-pointer rounded-full bg-[#d6336c] px-[16px] py-[6px] text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#c2255c]">
            {inCart ? 'Add more' : 'Add'}
          </button>
        </div>
      </div>
      <div className="p-[10px]">
        <p className="text-[14px] font-semibold text-[#202939]">{variant.nameBn || variant.name}</p>
        <p className="text-[14px]">
          <span className="font-semibold text-[#15803d]">{formatTaka(price)}</span>
          {original !== null && original > price && <span className="ml-[6px] text-[#9aa4b2] line-through">{formatTaka(original)}</span>}
          {unitLabel && <span className="ml-[4px] text-[12px] text-[#697586]">{unitLabel}</span>}
        </p>
        {inCart && <p className="mt-[2px] text-[12px] font-medium text-[#1daa61]">কার্টে আছে{inCart.priceUnit !== 'FIXED' ? ` (${inCart.quantity})` : ''}</p>}
      </div>
    </div>
  );
}

function Reviews({ subServiceId, first }: { subServiceId: string; first: CatalogReviewPage }) {
  const [pages, setPages] = useState<CatalogReviewPage[]>([first]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { summary } = first;
  const items = pages.flatMap((page) => page.items);
  const hasMore = items.length < summary.count;

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      // The details came with the newest five; the reviews endpoint pages by ten, so page 1 is fetched again and merged.
      const nextPage = Math.floor(items.length / 10) + 1;
      const page = await catalogService.getSubServiceReviews(subServiceId, nextPage);
      setPages((previous) => {
        const seen = new Set(previous.flatMap((entry) => entry.items.map((item) => item.id)));
        return [...previous, { ...page, items: page.items.filter((item) => !seen.has(item.id)) }];
      });
    } catch {
      toast.error('আরো রিভিউ লোড হয়নি');
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (summary.count === 0) return <Empty text="এখনো কোনো রিভিউ নেই। প্রথম অর্ডারের পর এখানে দেখা যাবে।" />;

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center gap-[20px] rounded-[12px] bg-[#f7f5f3] p-[14px]">
        <div className="text-center">
          <p className="text-[32px] font-bold leading-none text-[#202939]">{summary.average?.toFixed(2)}</p>
          <p className="mt-[4px] text-[14px] text-[#f5a524]">{'★'.repeat(Math.round(summary.average ?? 0))}</p>
          <p className="text-[12px] text-[#697586]">{summary.count} reviews</p>
        </div>
        <div className="flex flex-1 flex-col gap-[4px]">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.breakdown[star - 1];
            return (
              <div key={star} className="flex items-center gap-[8px] text-[12px] text-[#697586]">
                <span className="w-[10px]">{star}</span>
                <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#e5e5e5]">
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
          <li key={review.id} className="border-b border-[#efefef] pb-[10px]">
            <div className="flex items-center justify-between gap-[8px]">
              <p className="text-[14px] font-semibold text-[#202939]">{review.reviewerName}</p>
              <p className="text-[13px] text-[#f5a524]" aria-label={`${review.rating} out of 5`}>
                {'★'.repeat(review.rating)}
                <span className="text-[#cecece]">{'★'.repeat(Math.max(0, 5 - review.rating))}</span>
              </p>
            </div>
            <p className="text-[12px] text-[#697586]">Taken on {new Date(review.takenOn ?? review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {review.comment && <p className="mt-[4px] text-[14px] text-[#364152]">{review.comment}</p>}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button type="button" onClick={loadMore} disabled={isLoadingMore} className="cursor-pointer self-start text-[14px] font-semibold text-[#1daa61] underline disabled:opacity-50">
          {isLoadingMore ? 'Loading...' : 'View more reviews'}
        </button>
      )}
    </div>
  );
}

function Section({ id, title, children }: { id: SectionId; title: string; children: React.ReactNode }) {
  return (
    <section
      id={`service-section-${id}`}
      className="scroll-mt-[60px] rounded-[12px] border border-[#efefef] p-[16px]"
    >
      <h3 className="mb-[12px] text-[18px] font-semibold text-[#202939]">{title}</h3>
      {children}
    </section>
  );
}

function Checklist({ title, items, isIncluded }: { title: string; items: string[]; isIncluded: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-[12px]">
      <p className="mb-[6px] text-[15px] font-semibold text-[#202939]">{title}</p>
      <ul className="flex flex-col gap-[6px]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-[8px] text-[14px] text-[#364152]">
            <HugeiconsIcon icon={isIncluded ? CheckmarkCircle02Icon : Cancel01Icon} size={18} className={`mt-[1px] shrink-0 ${isIncluded ? 'text-[#1daa61]' : 'text-[#d64545]'}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const Empty = ({ text }: { text: string }) => <p className="text-[14px] text-[#697586]">{text}</p>;
