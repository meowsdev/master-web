'use client';

import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/services/services.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { AdminCategoryPanel } from './panels/AdminCategoryPanel';
import { AdminServicePanel } from './panels/AdminServicePanel';
import { ProvidersPanel } from './panels/ProvidersPanel';
import { TechniciansPanel } from './panels/TechniciansPanel';

/* The management panel the admin's rail opened, if any. */
export function AdminPanels() {
  const kind = useOrderPanelStore((state) => state.kind);
  const target = useOrderPanelStore((state) => state.orderId);
  const { data: services = [] } = useQuery({ queryKey: ['admin-services'], queryFn: () => servicesService.getServices() });
  const close = useOrderPanelStore((state) => state.close);

  if (kind === 'adminService') {
    // 'new' or 'new:<categoryId>' creates; anything else is a service id to edit.
    const isCreating = target === 'new' || Boolean(target?.startsWith('new:'));
    const service = isCreating ? null : services.find((item) => item.id === target) ?? null;
    // Editing waits for the service to load. The key gives each service (or new form) a fresh state.
    if (!isCreating && !service) return null;
    return <AdminServicePanel key={target} service={service} defaultCategoryId={target?.startsWith('new:') ? target.slice(4) : undefined} onClose={close} />;
  }
  if (kind === 'adminCategory') return <AdminCategoryPanel onClose={close} />;
  if (kind === 'adminTechnicians') return <TechniciansPanel onClose={close} />;
  if (kind === 'adminProviders') return <ProvidersPanel onClose={close} />;
  return null;
}
