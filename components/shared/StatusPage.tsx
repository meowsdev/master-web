import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatusPageProps {
  icon: LucideIcon;
  code?: string;
  title: string;
  description: string;
  /** Buttons / links rendered under the description. */
  actions?: ReactNode;
  /** Small muted line, e.g. the error reference id. */
  footnote?: string;
}

/**
 * Shared full-screen status layout (404, error, ...) in the app's
 * WhatsApp-style tokens, so every fallback page looks identical.
 */
export default function StatusPage({
  icon: Icon,
  code,
  title,
  description,
  actions,
  footnote,
}: StatusPageProps) {
  return (
    <main className="whatsapp-wallpaper flex h-screen w-screen items-center justify-center overflow-y-auto bg-[#efeae2] px-4 dark:bg-[#0b141a]">
      <section
        role="alert"
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-[#202c33]"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#d9fdd3] text-[#008069] dark:bg-[#005c4b] dark:text-[#d9fdd3]">
          <Icon className="h-8 w-8" aria-hidden />
        </div>
        {code && (
          <p className="mb-1 text-sm font-semibold tracking-widest text-[#008069] dark:text-[#25D366]">
            {code}
          </p>
        )}
        <h1 className="text-2xl font-semibold text-[#111b21] dark:text-[#e9edef]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#667781] dark:text-[#8696a0]">
          {description}
        </p>
        {actions && (
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {actions}
          </div>
        )}
        {footnote && (
          <p className="mt-5 text-xs text-[#667781] dark:text-[#8696a0]">
            {footnote}
          </p>
        )}
      </section>
    </main>
  );
}

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#008069] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#006e5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]';
export const secondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[#d1d7db] px-5 py-2.5 text-sm font-medium text-[#111b21] transition hover:bg-[#f0f2f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] dark:border-[#313d45] dark:text-[#e9edef] dark:hover:bg-[#111b21]';
