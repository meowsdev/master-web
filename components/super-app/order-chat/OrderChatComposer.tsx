'use client';

import { ReactNode, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Attachment01Icon, CallIcon, Mic01Icon, SentIcon } from '@hugeicons/core-free-icons';
import { ComingSoonDialog } from '../provider/ComingSoonDialog';

interface OrderChatComposerProps {
  draft: string;
  onDraftChange: (text: string) => void;
  onSubmit: () => void;
  canSend: boolean;
  /** A closed order's chat stays readable but cannot take new messages. */
  isDisabled?: boolean;
  /** Shown in the box while it is disabled, e.g. why the chat has not started yet. */
  disabledHint?: string;
  /** Role-specific buttons after the box, e.g. the provider's + menu of job actions. */
  actions?: ReactNode;
}

const iconButton = 'flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40';

/*
 * The one message box of every chat, for every role (customer, provider, technician, staff, support): attach, type,
 * voice message, and on the right call (empty box) or send (something typed). Roles add their own buttons through
 * `actions`. Attach, voice and call are not built yet and say so.
 */
export function OrderChatComposer({ draft, onDraftChange, onSubmit, canSend, isDisabled = false, disabledHint, actions }: OrderChatComposerProps) {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const comingSoon = () => setIsComingSoonOpen(true);
  const hasText = draft.trim().length > 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex shrink-0 items-center gap-[10px] bg-surface px-[16px] pb-[16px] pt-[8px]"
    >
      <div className="flex h-[48px] min-w-0 flex-1 items-center gap-[6px] rounded-[24px] bg-white px-[8px] shadow-sm">
        <button type="button" onClick={comingSoon} disabled={isDisabled} aria-label="Attach" title="Attach" className={iconButton}>
          <HugeiconsIcon icon={Attachment01Icon} size={20} />
        </button>

        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          maxLength={1000}
          disabled={isDisabled}
          placeholder={isDisabled && disabledHint ? disabledHint : 'Type a message'}
          className="min-w-0 flex-1 bg-transparent px-[4px] text-[14px] font-medium text-ink outline-none placeholder:text-muted"
        />

        <button type="button" onClick={comingSoon} disabled={isDisabled} aria-label="Voice message" title="Voice message" className={iconButton}>
          <HugeiconsIcon icon={Mic01Icon} size={20} />
        </button>

        {/* Something typed: send it. Nothing typed: call. */}
        {hasText ? (
          <button type="submit" disabled={!canSend || isDisabled} aria-label="Send message" title="Send" className="flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:bg-primary-disabled">
            <HugeiconsIcon icon={SentIcon} size={18} />
          </button>
        ) : (
          <button type="button" onClick={comingSoon} disabled={isDisabled} aria-label="Call" title="Call" className="flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:bg-primary-disabled">
            <HugeiconsIcon icon={CallIcon} size={18} />
          </button>
        )}
      </div>

      {actions}

      {isComingSoonOpen && <ComingSoonDialog onClose={() => setIsComingSoonOpen(false)} />}
    </form>
  );
}
