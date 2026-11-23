'use client';

/* A small "not available yet" notice for buttons whose feature is still on the way. */
export function ComingSoonDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-[16px]">
      <div role="dialog" aria-label="Coming soon" className="w-full max-w-[320px] rounded-[16px] bg-white p-[20px] text-center text-ink shadow-xl">
        <h3 className="text-[16px] font-semibold">Coming soon</h3>
        <p className="mt-[6px] text-[14px] font-medium text-muted">This feature is coming soon.</p>
        <button type="button" onClick={onClose} autoFocus className="mt-[16px] cursor-pointer rounded-[10px] bg-primary px-[24px] py-[8px] text-[14px] font-semibold text-white hover:bg-primary/90">
          OK
        </button>
      </div>
    </div>
  );
}
