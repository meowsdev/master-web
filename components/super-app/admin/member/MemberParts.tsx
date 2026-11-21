import { ReactNode } from 'react';
import { OrderStatus } from '@/types/order.types';
import { MemberStatus } from '@/types/admin-member.types';
import { ORDER_STATUS_LABEL } from '../../order-history/order-status';

/* Small building blocks shared by the provider, technician and customer detail sections. */

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#e5e5e5] py-[16px]">
      <h4 className="mb-[10px] text-[13px] font-semibold uppercase tracking-[0.4px] text-[#697586]">{title}</h4>
      {children}
    </section>
  );
}

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-[16px] py-[4px] text-[14px]">
      <span className="shrink-0 font-medium text-[#697586]">{label}</span>
      <span className="min-w-0 break-words text-right font-semibold text-[#202939]">{children}</span>
    </div>
  );
}

const STATUS_BADGE: Record<MemberStatus, { text: string; className: string }> = {
  ACTIVE: { text: 'Active', className: 'bg-[#d7fdd2] text-[#205737]' },
  INACTIVE: { text: 'Inactive', className: 'bg-[#f1f1f1] text-[#697586]' },
  SUSPENDED: { text: 'Blocked', className: 'bg-[#fff4e5] text-[#b7791f]' },
  BANNED: { text: 'Banned', className: 'bg-[#fde8e8] text-[#d64545]' },
};

export function StatusBadges({ status, isRestricted }: { status: MemberStatus; isRestricted: boolean }) {
  const badge = STATUS_BADGE[status];
  return (
    <span className="flex flex-wrap gap-[6px]">
      <span className={`rounded-full px-[8px] py-[2px] text-[12px] font-semibold ${badge.className}`}>{badge.text}</span>
      {isRestricted && <span className="rounded-full bg-[#fff4e5] px-[8px] py-[2px] text-[12px] font-semibold text-[#b7791f]">Restricted</span>}
    </span>
  );
}

/** "Complete 4 · Cancel 1": how many orders ended up where. */
export function OrderCounts({ byStatus }: { byStatus: Record<string, number> }) {
  const entries = Object.entries(byStatus).filter(([, count]) => count > 0);
  if (entries.length === 0) return <p className="text-[14px] font-medium text-[#697586]">No orders yet.</p>;
  return (
    <p className="flex flex-wrap gap-x-[14px] gap-y-[2px] text-[14px] font-semibold text-[#202939]">
      {entries.map(([status, count]) => {
        const label = ORDER_STATUS_LABEL[status as OrderStatus];
        return (
          <span key={status}>
            <span className={label?.className}>{label?.text ?? status}</span> {count}
          </span>
        );
      })}
    </p>
  );
}

/** Same review list the members see on their own profile. */
export { ReviewList } from '../../reviews/ReviewList';

export const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
