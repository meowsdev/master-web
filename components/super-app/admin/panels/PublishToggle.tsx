'use client';

/* Staff only: a small switch, Published (customers see it) or Unpublished (only staff see it). */
export function PublishToggle({ isPublished, onChange, disabled = false }: { isPublished: boolean; onChange: (isPublished: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublished}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!isPublished);
      }}
      title={isPublished ? 'Customer দেখতে পায়। চাপলে লুকাবে।' : 'Customer দেখতে পায় না। চাপলে দেখাবে।'}
      className="flex shrink-0 cursor-pointer items-center gap-[6px] text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className={`relative h-[18px] w-[32px] rounded-full transition-colors ${isPublished ? 'bg-primary' : 'bg-muted/40'}`}>
        <span className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow transition-all ${isPublished ? 'left-[16px]' : 'left-[2px]'}`} />
      </span>
      <span className={isPublished ? 'text-primary' : 'text-muted'}>{isPublished ? 'Published' : 'Unpublished'}</span>
    </button>
  );
}
