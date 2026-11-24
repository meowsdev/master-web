/** One number on an earnings page: label, value, an optional hint. Danger tone for money owed. */
export function StatTile({ label, value, hint, tone = 'normal' }: { label: string; value: string; hint?: string; tone?: 'normal' | 'danger' }) {
  return (
    <div className="flex flex-col gap-[2px] rounded-[12px] border border-line bg-white p-[12px]">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <span className={`text-[17px] font-semibold tracking-[-0.3px] ${tone === 'danger' ? 'text-[#d64545]' : 'text-ink'}`}>{value}</span>
      {hint && <span className="text-[11px] font-medium text-muted">{hint}</span>}
    </div>
  );
}
