'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { HelpCircleIcon, LockIcon, PencilEdit01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { useProviderLevel } from '@/hooks/useProviderEarnings';
import type { LevelMetricKey, ProviderLevel, ProviderLevelProgress } from '@/types/provider-earnings.types';
import { LEVEL_LABEL, bnDate, bnNumber } from './earnings-format';

type Metric = ProviderLevelProgress['metrics'][number];

const LEVEL_STEPS: ProviderLevel[] = ['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'TOP_RATED'];
/** Dots on a level's badge: Level 0 a ring, then one, two and three dots. */
const BADGE_DOTS: Record<ProviderLevel, number> = { LEVEL_0: 0, LEVEL_1: 1, LEVEL_2: 2, TOP_RATED: 3 };
const TARGET_ROWS = [
  { key: 'LEVEL_1', label: 'লেভেল ১ টার্গেট' },
  { key: 'LEVEL_2', label: 'লেভেল ২ টার্গেট' },
  { key: 'TOP_RATED', label: 'টপ রেটেড টার্গেট' },
] as const;

const cardClass = 'rounded-[14px] bg-white p-[16px] shadow-[0_1px_6px_rgba(32,41,57,0.12)]';
const inputClass = 'h-[40px] w-full rounded-[8px] border border-chip bg-white px-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary';
const saveButtonClass =
  'h-[40px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';
const cancelButtonClass = 'h-[40px] cursor-pointer rounded-[10px] border border-chip bg-white px-[16px] text-[14px] font-semibold text-ink hover:bg-surface';

type TargetValues = Record<'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED', number>;

/**
 * What an admin can do on one provider's Level page: give that provider a level. Without it the page is read-only
 * (the provider's own view). The targets are global and edited in the Levels tab (LevelTargetCards).
 */
export interface LevelAdminControls {
  onSetLevel: (body: { level: ProviderLevel; isLocked: boolean; reason?: string }, done: () => void) => void;
  isSavingLevel: boolean;
}

/** The small pencil button that opens an edit form; only an admin sees it. */
function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="flex cursor-pointer items-center gap-[4px] rounded-[8px] px-[6px] py-[4px] text-[13px] font-semibold text-primary hover:bg-secondary/40">
      <HugeiconsIcon icon={PencilEdit01Icon} size={15} strokeWidth={1.8} /> এডিট
    </button>
  );
}

/** A score on a bar (success score, rating, response rate) or a count against targets (orders, clients, earnings). */
const METRIC_INFO: Record<LevelMetricKey, { title: string; scale?: { max: number; digits: number; suffix?: string } }> = {
  successScore: { title: 'সাকসেস স্কোর', scale: { max: 10, digits: 1 } },
  rating: { title: 'রেটিং', scale: { max: 5, digits: 1 } },
  responseRate: { title: 'রেসপন্স রেট', scale: { max: 100, digits: 0, suffix: '%' } },
  orders: { title: 'অর্ডার' },
  uniqueClients: { title: 'আলাদা গ্রাহক' },
  earnings: { title: 'আয়' },
};

function helpText(key: LevelMetricKey, windowDays: number) {
  const days = bnNumber(windowDays);
  switch (key) {
    case 'successScore':
      return `গত ${days} দিনে শেষ হওয়া কাজের কতগুলো ভালোভাবে হয়েছে, ১০-এর মধ্যে: কাজ সম্পন্ন, আপনার মানের কারণে রিভিশন হয়নি, আর রেটিং ৪★ বা বেশি। কাজ নেওয়ার পর বাতিল বা বিরোধ হলে স্কোর কমে।`;
    case 'rating':
      return 'গ্রাহকদের পাবলিক রিভিউয়ের গড় রেটিং, ৫-এর মধ্যে।';
    case 'responseRate':
      return `গত ${days} দিনে যত নতুন অর্ডারের অফার পেয়েছেন, তার কত শতাংশের সময়মতো উত্তর (নেওয়া বা না নেওয়া) দিয়েছেন। কোনো অফার না পেলে এটা পূরণ ধরা হয়।`;
    case 'orders':
      return 'এ পর্যন্ত সম্পন্ন মোট কাজ।';
    case 'uniqueClients':
      return 'এ পর্যন্ত কতজন আলাদা গ্রাহকের কাজ করেছেন।';
    case 'earnings':
      return 'এ পর্যন্ত মোট নেট আয়: বিল থেকে প্ল্যাটফর্ম কমিশন বাদ দিয়ে, টিপসসহ।';
  }
}

const formatValue = (key: LevelMetricKey, value: number) => {
  if (key === 'earnings') return `৳${bnNumber(value)}`;
  const scale = METRIC_INFO[key].scale;
  return `${bnNumber(value, scale?.digits ?? 0)}${scale?.suffix ?? ''}`;
};

/** A hexagon badge with the level's dots. Reached levels are filled with the primary color. */
function LevelBadge({ level, size, isReached }: { level: ProviderLevel; size: number; isReached: boolean }) {
  const dots = BADGE_DOTS[level];
  const dotY = 50;
  const dotXs = dots === 1 ? [50] : dots === 2 ? [41, 59] : [36, 50, 64];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="shrink-0">
      <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" className={isReached ? 'fill-primary' : 'fill-muted/40'} />
      <polygon points="50,14 81,32 81,68 50,86 19,68 19,32" className={isReached ? 'fill-secondary' : 'fill-surface'} />
      {dots === 0 ? (
        <circle cx="50" cy={dotY} r="7" className={`fill-none ${isReached ? 'stroke-primary' : 'stroke-muted'}`} strokeWidth="4" />
      ) : (
        dotXs.map((x) => <circle key={x} cx={x} cy={dotY} r="6" className={isReached ? 'fill-primary' : 'fill-muted'} />)
      )}
    </svg>
  );
}

/** Level 0 · Level 1 · Level 2 · Top Rated, joined by a dotted line, with a marker over the level held now. */
function LevelSteps({ current, levels }: { current: ProviderLevel; levels: ProviderLevelProgress['levels'] }) {
  return (
    <ol className="relative mt-[18px] grid grid-cols-4">
      <span className="absolute left-[12.5%] right-[12.5%] top-[30px] border-t-2 border-dotted border-muted/50" aria-hidden />
      {LEVEL_STEPS.map((level) => {
        const isCurrent = level === current;
        const isReached = levels.find((item) => item.level === level)?.isReached ?? false;
        return (
          <li key={level} className="relative flex flex-col items-center" aria-current={isCurrent ? 'step' : undefined}>
            <span className={`h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent ${isCurrent ? 'border-t-ink' : 'border-t-transparent'}`} aria-hidden />
            <span className="relative mt-[4px] rounded-full bg-white px-[4px]">
              <LevelBadge level={level} size={32} isReached={isReached} />
            </span>
            <span className={`mt-[6px] text-center text-[11px] ${isCurrent ? 'font-semibold text-ink' : 'font-medium text-muted'}`}>{LEVEL_LABEL[level]}</span>
          </li>
        );
      })}
    </ol>
  );
}

function QualifiesBox({ label }: { label: string }) {
  return (
    <p className="mt-[14px] flex items-center gap-[8px] rounded-[10px] bg-secondary/40 px-[12px] py-[12px] text-[13px] font-semibold text-ink">
      <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.5} className="text-primary" />
      {label}
    </p>
  );
}

/** Admin: the three targets of one metric (Level 1, Level 2, Top Rated). A higher level may not need less. */
function TargetsForm({ metricKey, targets, isSaving, onSave, onCancel }: { metricKey: LevelMetricKey; targets: TargetValues; isSaving: boolean; onSave: (values: TargetValues) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Record<keyof TargetValues, string>>({
    LEVEL_1: String(targets.LEVEL_1),
    LEVEL_2: String(targets.LEVEL_2),
    TOP_RATED: String(targets.TOP_RATED),
  });
  const values: TargetValues = { LEVEL_1: Number(draft.LEVEL_1), LEVEL_2: Number(draft.LEVEL_2), TOP_RATED: Number(draft.TOP_RATED) };
  const max = METRIC_INFO[metricKey].scale?.max;
  const isNumber = TARGET_ROWS.every(({ key }) => draft[key].trim() !== '' && Number.isFinite(values[key]) && values[key] >= 0 && (max === undefined || values[key] <= max));
  const isInOrder = values.LEVEL_1 <= values.LEVEL_2 && values.LEVEL_2 <= values.TOP_RATED;
  const problem = !isNumber
    ? max === undefined
      ? '০ বা তার বেশি সংখ্যা দিন।'
      : `০ থেকে ${bnNumber(max)}-এর মধ্যে সংখ্যা দিন।`
    : !isInOrder
      ? 'উপরের লেভেলের টার্গেট নিচের লেভেলের চেয়ে কম হতে পারবে না।'
      : null;

  return (
    <div className="mt-[14px] rounded-[10px] bg-surface p-[12px]">
      <div className="flex flex-col gap-[10px]">
        {TARGET_ROWS.map((row) => (
          <label key={row.key} className="flex items-center justify-between gap-[12px] text-[13px] font-medium text-ink">
            <span className="shrink-0">{row.label}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={max}
              step={metricKey === 'rating' ? 0.1 : metricKey === 'successScore' ? 0.5 : 1}
              value={draft[row.key]}
              onChange={(event) => setDraft((previous) => ({ ...previous, [row.key]: event.target.value }))}
              className={`${inputClass} max-w-[160px]`}
            />
          </label>
        ))}
      </div>
      {problem && <p className="mt-[8px] text-[13px] font-medium text-[#d64545]">{problem}</p>}
      <p className="mt-[8px] text-[12px] font-medium text-muted">সব প্রোভাইডারের জন্য এই টার্গেট বদলাবে। পরবর্তী মূল্যায়নে নতুন টার্গেট দিয়ে লেভেল হিসাব হবে।</p>
      <div className="mt-[10px] flex gap-[8px]">
        <button type="button" disabled={problem !== null || isSaving} onClick={() => onSave(values)} className={saveButtonClass}>
          {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
        <button type="button" onClick={onCancel} className={cancelButtonClass}>
          বাতিল
        </button>
      </div>
    </div>
  );
}

function MetricCard({ metric, windowDays, goalLabel, qualifiesLabel }: { metric: Metric; windowDays: number; goalLabel: string; qualifiesLabel: string }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const info = METRIC_INFO[metric.key];
  const scale = info.scale;

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-[8px]">
        <h5 className="flex items-center gap-[6px] text-[16px] font-semibold text-ink">
          {info.title}
          <button
            type="button"
            onClick={() => setIsHelpOpen((open) => !open)}
            aria-expanded={isHelpOpen}
            aria-label={`${info.title} কী?`}
            className="flex cursor-pointer items-center text-muted hover:text-ink"
          >
            <HugeiconsIcon icon={HelpCircleIcon} size={17} />
          </button>
        </h5>
        {scale ? (
          <span className="text-[20px] font-semibold text-ink">{metric.value === null ? '-' : formatValue(metric.key, metric.value)}</span>
        ) : (
          <span className="text-[16px] font-semibold text-ink">
            {formatValue(metric.key, metric.value ?? 0)}
            <span className="font-medium text-muted"> / {formatValue(metric.key, metric.target)}</span>
          </span>
        )}
      </div>

      {isHelpOpen && <p className="mt-[8px] rounded-[10px] bg-surface p-[10px] text-[12px] font-medium leading-relaxed text-ink">{helpText(metric.key, windowDays)}</p>}

      {scale ? (
        <>
          <ScaleBar value={metric.value} target={metric.target} max={scale.max} label={info.title} />
          <div className="mt-[14px] flex items-center justify-between border-t border-line pt-[12px] text-[13px]">
            <span className="border-l-2 border-primary pl-[8px] font-medium text-ink">{goalLabel}</span>
            <span className="font-semibold text-ink">{formatValue(metric.key, metric.target)}</span>
          </div>
        </>
      ) : (
        <dl className="mt-[14px] flex flex-col gap-[10px] text-[13px]">
          {TARGET_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between">
              <dt className="font-medium text-muted">{row.label}</dt>
              <dd className="font-semibold text-ink">{formatValue(metric.key, metric.targets[row.key])}</dd>
            </div>
          ))}
        </dl>
      )}

      {metric.isMet && <QualifiesBox label={qualifiesLabel} />}
    </section>
  );
}

/** 0 … max with the filled part up to the value and a marker at the target, labelled under the bar. */
function ScaleBar({ value, target, max, label }: { value: number | null; target: number; max: number; label: string }) {
  const percent = (number: number) => Math.min(100, Math.max(0, (number / max) * 100));
  const targetPercent = percent(target);
  return (
    <div className="mt-[14px]">
      <div className="relative h-[8px] rounded-full bg-surface" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value ?? undefined}>
        {value !== null && <div className="h-full rounded-full bg-primary" style={{ width: `${percent(value)}%` }} />}
        <span className="absolute top-[-4px] h-[16px] w-[2px] -translate-x-1/2 rounded-full bg-primary" style={{ left: `${targetPercent}%` }} aria-hidden />
      </div>
      <div className="relative mt-[6px] h-[14px] text-[11px] font-medium text-muted">
        <span className="absolute left-0">{bnNumber(0)}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${targetPercent}%` }}>{bnNumber(target, 1)}</span>
        <span className="absolute right-0">{bnNumber(max)}</span>
      </div>
    </div>
  );
}

/** Admin: give this provider a level by hand, optionally locked against the monthly evaluation. */
function LevelForm({ data, admin, onClose }: { data: ProviderLevelProgress; admin: LevelAdminControls; onClose: () => void }) {
  const [level, setLevel] = useState<ProviderLevel>(data.level);
  const [isLocked, setIsLocked] = useState(data.isLevelLocked);
  const [reason, setReason] = useState(data.levelLockReason ?? '');
  return (
    <div className="mt-[14px] w-full rounded-[12px] bg-surface p-[14px]">
      <label className="flex flex-col gap-[6px] text-[13px] font-semibold text-ink">
        লেভেল
        <select value={level} onChange={(event) => setLevel(event.target.value as ProviderLevel)} className={`${inputClass} cursor-pointer`}>
          {LEVEL_STEPS.map((item) => (
            <option key={item} value={item}>
              {LEVEL_LABEL[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-[12px] flex cursor-pointer items-start gap-[8px] text-[13px] font-medium text-ink">
        <input type="checkbox" checked={isLocked} onChange={(event) => setIsLocked(event.target.checked)} className="mt-[2px] size-[16px] cursor-pointer accent-primary" />
        <span>
          লক করুন
          <span className="block text-[12px] text-muted">লক থাকলে মাসিক হিসাবে এই লেভেল বদলাবে না। লক না করলে পরবর্তী মূল্যায়নে আবার হিসাব হবে।</span>
        </span>
      </label>
      {isLocked && (
        <label className="mt-[12px] flex flex-col gap-[6px] text-[13px] font-semibold text-ink">
          কারণ (প্রোভাইডার দেখবেন)
          <input value={reason} maxLength={300} onChange={(event) => setReason(event.target.value)} className={inputClass} placeholder="যেমন: কাজের মান যাচাই করে টপ রেটেড দেওয়া হলো" />
        </label>
      )}
      <div className="mt-[12px] flex gap-[8px]">
        <button
          type="button"
          disabled={admin.isSavingLevel}
          onClick={() => admin.onSetLevel({ level, isLocked, reason: isLocked ? reason.trim() || undefined : undefined }, onClose)}
          className={saveButtonClass}
        >
          {admin.isSavingLevel ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
        <button type="button" onClick={onClose} className={cancelButtonClass}>
          বাতিল
        </button>
      </div>
    </div>
  );
}

/*
 * The Level page: the level held as a badge, the four levels in a row, and a card for each of the six numbers that
 * decide the level (success score, rating, response rate on a bar; orders, different customers and earnings against
 * each level's target). The provider sees it read-only; an admin sees the same page with edit buttons.
 */
export function LevelView({ data, admin }: { data: ProviderLevelProgress; admin?: LevelAdminControls }) {
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  // At Top Rated there is no next level: the targets shown are the ones that keep it.
  const goalLabel = data.nextLevel ? 'পরবর্তী লেভেলের জন্য দরকার' : 'টপ রেটেড ধরে রাখতে দরকার';
  const qualifiesLabel = data.nextLevel ? 'পরবর্তী লেভেলের যোগ্য' : 'টপ রেটেড ধরে রাখার যোগ্য';

  return (
    <div className="pb-[24px]">
      <div className="flex flex-col items-center pt-[4px]">
        <LevelBadge level={data.level} size={92} isReached />
        <p className="mt-[8px] flex items-center gap-[6px] text-[20px] font-semibold text-ink">
          {LEVEL_LABEL[data.level]}
          {data.isLevelLocked && (
            <span title="অ্যাডমিন লক করেছেন" className="flex text-muted">
              <HugeiconsIcon icon={LockIcon} size={16} />
            </span>
          )}
        </p>
        <p className="text-[12px] font-medium text-muted">পরবর্তী মূল্যায়ন: {bnDate(data.nextEvaluationAt)}</p>
        {admin && !isEditingLevel && (
          <span className="mt-[6px]">
            <EditButton label="লেভেল এডিট" onClick={() => setIsEditingLevel(true)} />
          </span>
        )}
        {admin && isEditingLevel && <LevelForm data={data} admin={admin} onClose={() => setIsEditingLevel(false)} />}
      </div>

      <LevelSteps current={data.level} levels={data.levels} />

      {data.isLevelLocked && (
        <p className="mt-[16px] rounded-[12px] border border-secondary bg-white p-[12px] text-[13px] font-medium text-ink">
          এই লেভেল অ্যাডমিন নির্ধারণ করেছেন, মাসিক হিসাবে বদলাবে না।
          {data.levelLockReason && <span className="mt-[4px] block text-muted">কারণ: {data.levelLockReason}</span>}
        </p>
      )}

      {!data.isLevelLocked && data.projectedLevel !== data.level && (
        <p className="mt-[16px] rounded-[12px] border border-secondary bg-white p-[12px] text-[13px] font-medium text-ink">
          এখনকার হিসাবে পরবর্তী মূল্যায়নে লেভেল হবে <span className="font-semibold">{LEVEL_LABEL[data.projectedLevel]}</span>।
        </p>
      )}

      <h4 className="mb-[12px] mt-[24px] text-[18px] font-semibold text-ink">পারফরম্যান্স</h4>
      <div className="flex flex-col gap-[14px]">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} windowDays={data.windowDays} goalLabel={goalLabel} qualifiesLabel={qualifiesLabel} />
        ))}
      </div>

      <p className="mt-[16px] text-[12px] font-medium leading-relaxed text-muted">
        প্রতি মাসের ১ তারিখে লেভেল ঠিক হয়। পরবর্তী লেভেলে যেতে ছয়টা শর্তই পূরণ করতে হবে। সাকসেস স্কোর আর রেসপন্স রেট গত {bnNumber(data.windowDays)} দিনের কাজ দেখে হিসাব হয়, বাকিগুলো এ পর্যন্ত মোট।
      </p>
    </div>
  );
}

/** One metric's card in the global target editor: the three level targets, with Edit for an admin. */
function TargetCard({ metricKey, targets, windowDays, canEdit, isSaving, onSave }: { metricKey: LevelMetricKey; targets: TargetValues; windowDays: number; canEdit: boolean; isSaving: boolean; onSave: (values: TargetValues, done: () => void) => void }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const info = METRIC_INFO[metricKey];
  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-[8px]">
        <h5 className="flex items-center gap-[6px] text-[16px] font-semibold text-ink">
          {info.title}
          <button type="button" onClick={() => setIsHelpOpen((open) => !open)} aria-expanded={isHelpOpen} aria-label={`${info.title} কী?`} className="flex cursor-pointer items-center text-muted hover:text-ink">
            <HugeiconsIcon icon={HelpCircleIcon} size={17} />
          </button>
        </h5>
        {canEdit && !isEditing && <EditButton label={`${info.title}-এর টার্গেট এডিট`} onClick={() => setIsEditing(true)} />}
      </div>
      {isHelpOpen && <p className="mt-[8px] rounded-[10px] bg-surface p-[10px] text-[12px] font-medium leading-relaxed text-ink">{helpText(metricKey, windowDays)}</p>}
      {isEditing ? (
        <TargetsForm metricKey={metricKey} targets={targets} isSaving={isSaving} onCancel={() => setIsEditing(false)} onSave={(values) => onSave(values, () => setIsEditing(false))} />
      ) : (
        <dl className="mt-[14px] flex flex-col gap-[10px] text-[13px]">
          {TARGET_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between">
              <dt className="font-medium text-muted">{row.label}</dt>
              <dd className="font-semibold text-ink">{formatValue(metricKey, targets[row.key])}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

const METRIC_ORDER: LevelMetricKey[] = ['successScore', 'rating', 'responseRate', 'orders', 'uniqueClients', 'earnings'];

/*
 * The global level targets (one table for every provider), in the same cards as the Level page. An admin edits a
 * metric's three targets at once; everyone else reads them.
 */
export function LevelTargetCards({
  table,
  windowDays,
  canEdit,
  isSaving,
  onSave,
}: {
  table: Record<'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED', Record<LevelMetricKey, number>>;
  windowDays: number;
  canEdit: boolean;
  isSaving: boolean;
  onSave: (metric: LevelMetricKey, values: TargetValues, done: () => void) => void;
}) {
  return (
    <div className="flex flex-col gap-[14px]">
      {METRIC_ORDER.map((key) => (
        <TargetCard
          key={key}
          metricKey={key}
          targets={{ LEVEL_1: table.LEVEL_1[key], LEVEL_2: table.LEVEL_2[key], TOP_RATED: table.TOP_RATED[key] }}
          windowDays={windowDays}
          canEdit={canEdit}
          isSaving={isSaving}
          onSave={(values, done) => onSave(key, values, done)}
        />
      ))}
    </div>
  );
}

/** A level's small hexagon and name, for lists. */
export function LevelChip({ level, isLocked }: { level: ProviderLevel; isLocked?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-[4px] text-[12px] font-semibold text-ink">
      <LevelBadge level={level} size={20} isReached={level !== 'LEVEL_0'} />
      {LEVEL_LABEL[level]}
      {isLocked && (
        <span title="অ্যাডমিন লক করেছেন" className="flex text-muted">
          <HugeiconsIcon icon={LockIcon} size={13} />
        </span>
      )}
    </span>
  );
}

/* The provider's own "লেভেল" tab. */
export function LevelTab({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useProviderLevel(userId, true);
  if (isLoading) return <p className="text-[14px] font-medium text-muted">লেভেল লোড হচ্ছে...</p>;
  if (isError || !data) return <p className="text-[14px] font-medium text-[#d64545]">লেভেল লোড করা যায়নি।</p>;
  return <LevelView data={data} />;
}
