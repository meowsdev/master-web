import { SupportDirectoryEntry } from '@/types/support-chat.types';

type StatusFields = Pick<SupportDirectoryEntry, 'status' | 'isRestricted'>;

/** The filter chips under the search box, in the order staff look for trouble. "All" is added by the shared list top. */
export const MEMBER_STATUS_FILTERS = ['Active', 'Restricted', 'Blocked', 'Banned'] as const;

/**
 * The one status word shown beside a name, in the same style as an order's status (Complete, Pending...).
 * The heaviest state wins; a restriction on top of a block or ban is added after it, so nothing is hidden.
 */
export function memberStatusLabel({ status, isRestricted }: StatusFields): { text: string; className: string } {
  if (status === 'BANNED') return { text: isRestricted ? 'Banned · Restricted' : 'Banned', className: 'text-[#d64545]' };
  if (status === 'SUSPENDED') return { text: isRestricted ? 'Blocked · Restricted' : 'Blocked', className: 'text-[#d64545]' };
  if (status === 'INACTIVE') return { text: isRestricted ? 'Inactive · Restricted' : 'Inactive', className: 'text-muted' };
  if (isRestricted) return { text: 'Restricted', className: 'text-[#b7791f]' };
  return { text: 'Active', className: 'text-primary' };
}

/** Which chip a person belongs to. Restricted also matches a blocked or banned person who is restricted too. */
export function matchesMemberFilter(member: StatusFields, chip: string): boolean {
  switch (chip) {
    case 'Active':
      return member.status === 'ACTIVE' && !member.isRestricted;
    case 'Restricted':
      return member.isRestricted;
    case 'Blocked':
      return member.status === 'SUSPENDED';
    case 'Banned':
      return member.status === 'BANNED';
    default:
      return true;
  }
}
