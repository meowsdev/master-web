'use client';

import { useState } from 'react';
import { MemberDetails, ModerationAction } from '@/types/admin-member.types';
import { Section } from './MemberParts';

interface MemberActionsProps {
  member: Pick<MemberDetails, 'status' | 'isRestricted' | 'role'>;
  /** Only an admin may ban or unban; the backend refuses managers too. */
  canBan: boolean;
  isBusy: boolean;
  onAct: (action: ModerationAction, reason?: string) => void;
}

interface ActionOption {
  action: ModerationAction;
  label: string;
  /** What it does, shown in the confirmation. */
  effect: string;
  isDanger?: boolean;
  /** Taking something away asks for a reason; lifting it does not. */
  asksReason: boolean;
}

/* Which actions make sense right now for this member's state. */
function availableActions(member: MemberActionsProps['member'], canBan: boolean): ActionOption[] {
  const isCustomer = member.role === 'CUSTOMER';
  const options: ActionOption[] = [];

  options.push(
    member.isRestricted
      ? { action: 'UNRESTRICT', label: 'Remove restriction', effect: isCustomer ? 'They can place orders again.' : 'They can be offered new orders again.', asksReason: false }
      : { action: 'RESTRICT', label: 'Restrict orders', effect: isCustomer ? 'They cannot place new orders. They stay signed in.' : 'They get no new orders. They stay signed in and keep their current work.', asksReason: true },
  );

  if (member.status === 'ACTIVE') {
    options.push({ action: 'BLOCK', label: 'Block', effect: 'They are signed out and cannot sign in until you unblock them.', isDanger: true, asksReason: true });
  }
  if (member.status === 'SUSPENDED') {
    options.push({ action: 'UNBLOCK', label: 'Unblock', effect: 'They can sign in again.', asksReason: false });
  }
  if (canBan && member.status !== 'BANNED') {
    options.push({ action: 'BAN', label: 'Ban', effect: 'A ban is for serious cases: they are signed out and only an admin can lift it.', isDanger: true, asksReason: true });
  }
  if (canBan && member.status === 'BANNED') {
    options.push({ action: 'UNBAN', label: 'Unban', effect: 'They can sign in again.', asksReason: false });
  }
  return options;
}

/* Restrict / block / ban and lift them. Every action asks for a confirmation first, and a reason when it takes something away. */
export function MemberActions({ member, canBan, isBusy, onAct }: MemberActionsProps) {
  const [pending, setPending] = useState<ActionOption | null>(null);
  const [reason, setReason] = useState('');

  const options = availableActions(member, canBan);
  const close = () => {
    setPending(null);
    setReason('');
  };

  return (
    <Section title="Actions">
      <div className="flex flex-wrap gap-[8px]">
        {options.map((option) => (
          <button
            key={option.action}
            type="button"
            disabled={isBusy}
            onClick={() => setPending(option)}
            className={`h-[36px] cursor-pointer rounded-[10px] border px-[14px] text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${option.isDanger ? 'border-[#d64545] text-[#d64545] hover:bg-[#fde8e8]' : 'border-[#202939] text-[#202939] hover:bg-[#f7f5f3]'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {pending && (
        <div className="mt-[12px] rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[12px]">
          <p className="text-[14px] font-semibold text-[#202939]">{pending.label}?</p>
          <p className="mt-[2px] text-[13px] font-medium text-[#697586]">{pending.effect}</p>
          {pending.asksReason && (
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Reason (kept in the history)"
              className="mt-[8px] w-full resize-none rounded-[8px] border border-[#cecece] bg-white p-[8px] text-[14px] font-medium text-[#202939] outline-none focus:border-[#1daa61]"
            />
          )}
          <div className="mt-[10px] flex gap-[8px]">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                onAct(pending.action, reason);
                close();
              }}
              className={`h-[34px] cursor-pointer rounded-[8px] px-[14px] text-[13px] font-semibold text-white disabled:opacity-50 ${pending.isDanger ? 'bg-[#d64545] hover:bg-[#bd3b3b]' : 'bg-[#1daa61] hover:bg-[#189452]'}`}
            >
              Confirm
            </button>
            <button type="button" onClick={close} className="h-[34px] cursor-pointer rounded-[8px] border border-[#cecece] bg-white px-[14px] text-[13px] font-semibold text-[#202939]">
              Cancel
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
