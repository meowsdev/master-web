'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Medal01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { useProviderLevel } from '@/hooks/useProviderEarnings';
import { LEVEL_LABEL, bnDate, bnNumber } from './earnings-format';

const sectionTitleClass = 'mb-[8px] mt-[22px] text-[13px] font-semibold uppercase tracking-[0.4px] text-muted';

function ProgressRow({ label, current, target, isMet, digits }: { label: string; current: number; target: number; isMet: boolean; digits: number }) {
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;
  return (
    <div className="rounded-[12px] border border-line bg-white p-[12px]">
      <div className="flex items-center justify-between gap-[8px]">
        <span className="text-[14px] font-semibold text-ink">{label}</span>
        <span className={`flex items-center gap-[4px] text-[13px] font-semibold ${isMet ? 'text-primary' : 'text-ink'}`}>
          {isMet && <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.5} />}
          {bnNumber(current, digits)} / {bnNumber(target, digits)}
        </span>
      </div>
      <div className="mt-[8px] h-[8px] overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/*
 * "লেভেল": the level the provider holds, what the next one needs and how close they are, and every level's
 * requirements. Levels are set on the 1st of each month from the last 30 days of completed work and the rating.
 */
export function LevelTab({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useProviderLevel(userId, true);
  if (isLoading) return <p className="text-[14px] font-medium text-muted">লেভেল লোড হচ্ছে...</p>;
  if (isError || !data) return <p className="text-[14px] font-medium text-[#d64545]">লেভেল লোড করা যায়নি।</p>;

  const { metrics } = data;
  const ordersLabel = `গত ${bnNumber(data.windowDays)} দিনে সম্পন্ন কাজ`;

  return (
    <div className="pb-[24px]">
      <div className="flex items-center gap-[14px] rounded-[14px] bg-secondary p-[16px]">
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-white text-primary">
          <HugeiconsIcon icon={Medal01Icon} size={28} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[13px] font-semibold text-ink">আপনার লেভেল</span>
          <span className="text-[24px] font-semibold tracking-[-0.5px] text-ink">{LEVEL_LABEL[data.level]}</span>
          <span className="text-[12px] font-medium text-ink">পরবর্তী মূল্যায়ন: {bnDate(data.nextEvaluationAt)}</span>
        </span>
      </div>

      {data.projectedLevel !== data.level && (
        <p className="mt-[10px] rounded-[12px] border border-secondary bg-white p-[12px] text-[13px] font-medium text-ink">
          এখনকার হিসাবে পরবর্তী মূল্যায়নে আপনার লেভেল হবে <span className="font-semibold">{LEVEL_LABEL[data.projectedLevel]}</span>।
        </p>
      )}

      <div className="mt-[12px] grid grid-cols-3 gap-[8px] text-center">
        {[
          { label: `${bnNumber(data.windowDays)} দিনে কাজ`, value: bnNumber(metrics.completedOrdersInWindow) },
          { label: `রেটিং (${bnNumber(metrics.reviewCount)})`, value: metrics.rating > 0 ? `★ ${bnNumber(metrics.rating, 2)}` : 'নেই' },
          { label: 'মোট কাজ', value: bnNumber(metrics.totalCompletedOrders) },
        ].map((item) => (
          <div key={item.label} className="rounded-[12px] border border-line bg-white px-[6px] py-[10px]">
            <p className="text-[16px] font-semibold text-ink">{item.value}</p>
            <p className="text-[11px] font-medium text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      {data.nextLevel ? (
        <>
          <p className={sectionTitleClass}>{LEVEL_LABEL[data.nextLevel]} লেভেলে যেতে</p>
          <div className="flex flex-col gap-[8px]">
            {data.requirementsForNext.map((item) => (
              <ProgressRow
                key={item.key}
                label={item.key === 'orders' ? ordersLabel : 'গ্রাহকের গড় রেটিং'}
                current={item.current}
                target={item.target}
                isMet={item.isMet}
                digits={item.key === 'rating' ? 2 : 0}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-[16px] rounded-[12px] bg-surface p-[14px] text-[13px] font-medium text-ink">আপনি সর্বোচ্চ লেভেলে আছেন। এই মান ধরে রাখুন।</p>
      )}

      <p className={sectionTitleClass}>সব লেভেল</p>
      <ul className="flex flex-col gap-[8px]">
        {data.levels.map((item) => {
          const isCurrent = item.level === data.level;
          return (
            <li
              key={item.level}
              className={`flex items-center justify-between gap-[12px] rounded-[12px] border p-[12px] ${isCurrent ? 'border-primary bg-secondary/40' : 'border-line bg-white'}`}
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-[14px] font-semibold text-ink">
                  {LEVEL_LABEL[item.level]}
                  {isCurrent && <span className="ml-[6px] text-[12px] font-semibold text-primary">(বর্তমান)</span>}
                </span>
                <span className="text-[12px] font-medium text-muted">
                  {item.minOrders === 0 ? 'শুরুর লেভেল' : `${ordersLabel} ${bnNumber(item.minOrders)}+ · রেটিং ${bnNumber(item.minRating, 1)}+`}
                </span>
              </span>
              {item.isReached && (
                <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.5} />
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-[16px] text-[12px] font-medium leading-relaxed text-muted">
        প্রতি মাসের ১ তারিখে গত {bnNumber(data.windowDays)} দিনের সম্পন্ন কাজ আর গ্রাহকের গড় রেটিং দেখে লেভেল ঠিক হয়। দুইটা শর্তই পূরণ হলে লেভেল ওঠে।
      </p>
    </div>
  );
}
