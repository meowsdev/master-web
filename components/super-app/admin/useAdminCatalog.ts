import { useQuery } from '@tanstack/react-query';
import { AdminGroup, AdminMainService, catalogAdminService } from '@/services/catalog-admin.service';

export interface AdminMainEntry extends AdminMainService {
  /** The top-bar category it sits in; null when it is in none (customers do not see it). */
  group: AdminGroup | null;
}

/* The whole catalog as the admin sees it, hidden rows included: categories, and every main service with its category. */
export function useAdminCatalog() {
  const tree = useQuery({ queryKey: ['admin-catalog-tree'], queryFn: catalogAdminService.tree });
  const { data: ungrouped = [] } = useQuery({ queryKey: ['admin-catalog-ungrouped'], queryFn: catalogAdminService.ungrouped });
  const groups = tree.data ?? [];
  const mains: AdminMainEntry[] = [
    ...groups.flatMap((group) => group.categories.map((main) => ({ ...main, group }))),
    ...ungrouped.map((main) => ({ ...main, services: main.services ?? [], faqs: main.faqs ?? [], group: null })),
  ];
  return { groups, mains, isLoading: tree.isLoading };
}

export const isImageSource = (value?: string | null) => Boolean(value && /^(https?:)?\/\/|^\//.test(value));
