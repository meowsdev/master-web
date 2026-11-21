'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon } from '@hugeicons/core-free-icons';

interface OrderChatComposerProps {
  draft: string;
  onDraftChange: (text: string) => void;
  onSubmit: () => void;
  canSend: boolean;
  /** A closed order's chat stays readable but cannot take new messages. */
  isDisabled?: boolean;
  /** Shown in the box while it is disabled, e.g. why the chat has not started yet. */
  disabledHint?: string;
}

/* The pill message box of the Figma order chat, shared by customer and provider. */
export function OrderChatComposer({ draft, onDraftChange, onSubmit, canSend, isDisabled = false, disabledHint }: OrderChatComposerProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex shrink-0 items-center gap-[10px] bg-[#f7f5f3] px-[16px] pb-[16px] pt-[8px]"
    >
      <input
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        maxLength={1000}
        disabled={isDisabled}
        placeholder={isDisabled && disabledHint ? disabledHint : 'Type a message'}
        className="h-[44px] min-w-0 flex-1 rounded-[22px] bg-white px-[18px] text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#9aa4b2]"
      />
      <button
        type="submit"
        disabled={!canSend || isDisabled}
        aria-label="Send message"
        className="flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1daa61] text-white disabled:opacity-50"
      >
        <HugeiconsIcon icon={SentIcon} size={20} />
      </button>
    </form>
  );
}
