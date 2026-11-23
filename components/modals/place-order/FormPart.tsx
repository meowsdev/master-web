'use client';

import { ReactNode } from 'react';

interface FormPartProps {
  step: number;
  title: string;
  /** One short line on what this part asks for. */
  hint: string;
  /** Everything in this part is filled in: the number turns into a tick. */
  isDone: boolean;
  children: ReactNode;
}

/*
 * One numbered part of the Place Order form, in its own card, so the customer sees at a glance that the
 * form asks two separate things (what the problem is, then where and when) and which part is still open.
 */
export function FormPart({isDone, children }: FormPartProps) {
  return (
    <section className={`mt-[16px] rounded-[16px] border bg-white px-[16px] pb-[16px] pt-[1px] transition-colors ${isDone ? 'border-primary/50' : 'border-line'}`}>
      {children}
    </section>
  );
}
