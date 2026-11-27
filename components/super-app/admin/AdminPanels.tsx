'use client';

import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/services/services.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminCategoryPanel } from './panels/AdminCategoryPanel';
import { AdminCatalogPanel } from './panels/AdminCatalogPanel';
import { AdminAddMemberPanel } from './panels/AdminAddMemberPanel';
import { AdminAssignOrderPanel } from './panels/AdminAssignOrderPanel';
import { AdminCreateOrderPanel } from './panels/AdminCreateOrderPanel';
import { MemberDetailsPanel } from './member/MemberDetailsPanel';
import { AdminServicePanel } from './panels/AdminServicePanel';
import { ProvidersPanel } from './panels/ProvidersPanel';
import { AddStaffPanel, StaffDetailsPanel } from './staff/StaffPanels';
import { WithdrawalPanel } from './withdrawals/WithdrawalPanel';
import { LevelTargetsPanel, ProviderLevelPanel } from './levels/LevelPanels';
import { DispatchRankingPanel } from './dispatch/DispatchRankingPanel';

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
  if (kind === 'adminCatalog') return <AdminCatalogPanel onClose={close} />;
  if (kind === 'adminProviders') return <ProvidersPanel onClose={close} />;
  if (kind === 'adminAddMember' && adminId && (target === 'PROVIDER' || target === 'TECHNICIAN' || target === 'CUSTOMER')) {
    return <AdminAddMemberPanel key={target} adminId={adminId} role={target} onClose={close} />;
  }
  // One panel per order: another order gets a fresh list and mode.
  if (kind === 'adminAssign' && target && adminId) return <AdminAssignOrderPanel key={target} adminId={adminId} orderId={target} onClose={close} />;
  if (kind === 'adminOrder' && adminId) return <AdminCreateOrderPanel adminId={adminId} onClose={close} />;
  // One panel per member: a different person gets fresh state.
  if (kind === 'adminMember' && target && adminId) return <MemberDetailsPanel key={target} adminId={adminId} memberId={target} onClose={close} />;
  if (kind === 'adminAddStaff' && adminId) return <AddStaffPanel adminId={adminId} onClose={close} />;
  if (kind === 'adminStaff' && target && adminId) return <StaffDetailsPanel key={target} adminId={adminId} staffId={target} onClose={close} />;
  if (kind === 'adminWithdrawal' && target && adminId) return <WithdrawalPanel key={target} adminId={adminId} withdrawalId={target} onClose={close} />;
  if (kind === 'adminLevelTargets' && adminId) return <LevelTargetsPanel adminId={adminId} onClose={close} />;
  if (kind === 'adminDispatchRanking' && adminId) return <DispatchRankingPanel adminId={adminId} onClose={close} />;
  // One panel per provider: a different provider gets fresh state.
  if (kind === 'adminProviderLevel' && target && adminId) return <ProviderLevelPanel key={target} adminId={adminId} providerUserId={target} onClose={close} />;
  return null;
}
