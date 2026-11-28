'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { OrderStatusLogEntry, OrderStatusRequestEntry } from '@/types/order.types';
import { ORDER_STATUS_BOX_LABEL } from './OrderStatusBox';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  PROVIDER: 'Provider',
  TECHNICIAN: 'Technician',
};

/** "In progress → Cancelled", or "Hold" / "Resume" when only the hold changed. */
function changeText(entry: OrderStatusLogEntry) {
  if (entry.fromStatus === entry.toStatus && entry.wasOnHold !== entry.isOnHold) return entry.isOnHold ? 'Hold' : 'Resume';
  const from = entry.wasOnHold ? 'Hold' : ORDER_STATUS_BOX_LABEL[entry.fromStatus].text;
  return `${from} → ${ORDER_STATUS_BOX_LABEL[entry.toStatus].text}`;
}

const who = (name: string | null, role: string) =>
  `${name || ROLE_LABEL[role] || 'Staff'}${ROLE_LABEL[role] && name ? ` (${ROLE_LABEL[role]})` : ''}`;

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

interface Row {
  key: string;
  at: string;
  title: string;
  reason: string;
  byline: string;
  isRejected?: boolean;
}

/*
 * In every role's order chat, after the messages: each change made from the status box, who made it and why, so the
 * customer, the provider, the technician and staff all see the same reasons. An approved request says which admin
 * approved it. With showRequests (provider, technician and staff, never the customer) the requests an admin turned
 * down show too, with the admin's note. Nothing shows until there is something.
 */
export function OrderStatusHistory({ orderId, showRequests = false }: { orderId: string; showRequests?: boolean }) {
  const { data: entries = [] } = useQuery({
    queryKey: ['order-status-log', orderId],
    queryFn: () => ordersService.getStatusLog(orderId),
    refetchInterval: 15_000,
  });
  const { data: requests = [] } = useQuery<OrderStatusRequestEntry[]>({
    queryKey: ['order-status-requests', orderId],
    queryFn: () => ordersService.getStatusRequests(orderId),
    enabled: showRequests,
    refetchInterval: 15_000,
  });

  const rows: Row[] = [
    ...entries.map((entry) => ({
      key: entry.id,
      at: entry.createdAt,
      title: changeText(entry),
      reason: entry.reason,
      byline: `${who(entry.changedByName, entry.changedByRole)}${entry.approvedByName ? ` · ${entry.approvedByName} (Admin) অনুমোদন দিয়েছেন` : ''}`,
    })),
    ...(showRequests ? requests : [])
      .filter((request) => request.state === 'REJECTED')
      .map((request) => ({
        key: request.id,
        at: request.decidedAt ?? request.createdAt,
        title: `${request.onHold ? 'Hold' : 'Cancel'}-এর অনুরোধ বাতিল`,
        reason: `অনুরোধ: ${request.reason}\nAdmin: ${request.decisionNote ?? ''}`,
        byline: `${who(request.requestedByName, request.requestedByRole)} চেয়েছিলেন · ${request.decidedByName || 'Admin'} বাতিল করেছেন`,
        isRejected: true,
      })),
  ].sort((first, second) => second.at.localeCompare(first.at));

  if (rows.length === 0) return null;

  return (
    <section className="rounded-[12px] bg-white p-[12px]">
      <h4 className="text-[13px] font-semibold text-ink">Status history</h4>
      <ul className="mt-[8px] flex flex-col gap-[10px]">
        {rows.map((row) => (
          <li key={row.key} className={`border-l-[3px] pl-[10px] ${row.isRejected ? 'border-[#d64545]' : 'border-secondary'}`}>
            <p className="text-[13px] font-semibold text-ink">{row.title}</p>
            <p className="mt-[2px] whitespace-pre-line text-[13px] text-ink">{row.reason}</p>
            <p className="mt-[2px] text-[12px] text-muted">
              {row.byline} · {when(row.at)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
