'use client';

import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/services/services.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminCategoryPanel } from './panels/AdminCategoryPanel';
import { AdminAddMemberPanel } from './panels/AdminAddMemberPanel';
import { AdminAssignOrderPanel } from './panels/AdminAssignOrderPanel';
import { AdminCreateOrderPanel } from './panels/AdminCreateOrderPanel';
import { MemberDetailsPanel } from './member/MemberDetailsPanel';
import { AdminServicePanel } from './panels/AdminServicePanel';
import { ProvidersPanel } from './panels/ProvidersPanel';

/* The management panel the admin's rail opened, if any. */
export function AdminPanels() {
  const kind = useOrderPanelStore((state) => state.kind);
  const target = useOrderPanelStore((state) => state.orderId);
  const { data: services = [] } = useQuery({ queryKey: ['admin-services'], queryFn: () => servicesService.getServices() });
  const close = useOrderPanelStore((state) => state.close);
  const adminId = useAuthStore((state) => state.user?.id);

  if (kind === 'adminService') {
    // 'new' or 'new:<categoryId>' creates; anything else is a service id to edit.
    const isCreating = target === 'new' || Boolean(target?.startsWith('new:'));
    const service = isCreating ? null : services.find((item) => item.id === target) ?? null;
    // Editing waits for the service to load. The key gives each service (or new form) a fresh state.
    if (!isCreating && !service) return null;
    return <AdminServicePanel key={target} service={service} defaultCategoryId={target?.startsWith('new:') ? target.slice(4) : undefined} onClose={close} />;
  }
  if (kind === 'adminCategory') return <AdminCategoryPanel onClose={close} />;
  if (kind === 'adminProviders') return <ProvidersPanel onClose={close} />;
  if (kind === 'adminAddMember' && adminId && (target === 'PROVIDER' || target === 'TECHNICIAN' || target === 'CUSTOMER')) {
    return <AdminAddMemberPanel key={target} adminId={adminId} role={target} onClose={close} />;
  }
  // One panel per order: another order gets a fresh list and mode.
  if (kind === 'adminAssign' && target && adminId) return <AdminAssignOrderPanel key={target} adminId={adminId} orderId={target} onClose={close} />;
  if (kind === 'adminOrder' && adminId) return <AdminCreateOrderPanel adminId={adminId} onClose={close} />;
  // One panel per member: a different person gets fresh state.
  if (kind === 'adminMember' && target && adminId) return <MemberDetailsPanel key={target} adminId={adminId} memberId={target} onClose={close} />;
  return null;
}
