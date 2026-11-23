'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogService } from '@/services/catalog.service';
import { ordersService } from '@/services/orders.service';
import { conversationMainServiceId, mainServiceToEntry, orderMainServiceId } from '@/lib/main-service';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Service } from '@/types/service.types';
import { Order } from '@/types/order.types';
import { ChatSession } from '@/types/chat.types';
import { FilterChip, CustomFilterList } from '@/types/super-app.types';

const STORAGE_KEY_CUSTOM_FILTERS = 'superapp_custom_filters_v1';
const STORAGE_KEY_SAVED_SERVICES = 'superapp_saved_services_v1';

interface UseServicesFilterProps {
  runningServiceIds?: string[];
  serviceLastActivity?: Record<string, number>;
}

/**
 * Hook to manage backend service fetching, search query filtering,
 * WhatsApp Web filter chip states (All, Running, Unread, Favorites, Save),
 * and dynamic user-created custom filter lists.
 */
export function useServicesFilter({
  runningServiceIds = [],
  serviceLastActivity = {},
}: UseServicesFilterProps = {}) {
  const { user, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilterChip, setActiveFilterChip] = useState<FilterChip>('All');
  const [customFilters, setCustomFilters] = useState<CustomFilterList[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_FILTERS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED_SERVICES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // The chat list: main services (one chat each), shaped like services for the chat machinery (lib/main-service.ts).
  const { data: dbServices = [], isLoading: isServicesLoading } = useQuery<Service[]>({
    queryKey: ['super-app-services'],
    queryFn: async () => (await catalogService.getMainServices()).map(mainServiceToEntry),
  });

  // Top-bar categories, in the admin's order, for the chips.
  const { data: groups = [] } = useQuery({
    queryKey: ['catalog-groups'],
    queryFn: catalogService.getGroups,
    staleTime: 60_000,
  });

  // Fetch customer orders (shares cache with OrdersDrawer, scoped to authenticated user)
  const { data: customerOrders = [] } = useQuery<Order[]>({
    queryKey: ['my-orders-drawer', user?.id],
    queryFn: () => ordersService.getOrders(),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 10000,
  });

  // Fetch real user conversations from database for authenticated session
  const { data: userConversations = [] } = useQuery<ChatSession[]>({
    queryKey: ['user-conversations', user?.id],
    queryFn: () => chatService.getUserConversations(),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 5000,
  });

  // Index conversations by serviceId for fast O(1) unread state resolution
  const conversationByServiceId = useMemo(() => {
    const map = new Map<string, ChatSession>();
    // Keyed by main service: the chat list's entries are main services.
    for (const conv of userConversations) {
      const key = conversationMainServiceId(conv);
      if (key) map.set(key, conv);
    }
    return map;
  }, [userConversations]);

  // Create a new custom filter list and persist
  const createCustomFilter = (name: string, serviceIds: string[]) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Please enter a list name');
      return;
    }

    const newFilter: CustomFilterList = {
      id: 'list-' + Date.now(),
      name: trimmed,
      serviceIds,
      createdAt: Date.now(),
    };

    const updated = [...customFilters, newFilter];
    setCustomFilters(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_FILTERS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom filters to localStorage', e);
    }

    setActiveFilterChip(newFilter.name);
    setIsFilterModalOpen(false);
    toast.success(`Filter list "${trimmed}" created with ${serviceIds.length} services!`);
  };

  // Delete a custom filter list
  const deleteCustomFilter = (filterId: string) => {
    const target = customFilters.find((f) => f.id === filterId);
    const updated = customFilters.filter((f) => f.id !== filterId);
    setCustomFilters(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_FILTERS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update custom filters in localStorage', e);
    }

    if (target && activeFilterChip === target.name) {
      setActiveFilterChip('All');
    }
    toast.info(`Filter list removed`);
  };

  // Toggle saving a service to the "Save" list
  const toggleSaveService = (serviceId: string) => {
    let updated: string[];
    const isAlreadySaved = savedServiceIds.includes(serviceId);

    if (isAlreadySaved) {
      updated = savedServiceIds.filter((id) => id !== serviceId);
      toast.info('Removed from Saved services');
    } else {
      updated = [...savedServiceIds, serviceId];
      toast.success('Saved to your Save list!');
    }

    setSavedServiceIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_SERVICES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const isServiceSaved = (serviceId: string) => savedServiceIds.includes(serviceId);

  // Filtered services based on search query, standard chips, and custom filter lists
  const filteredServices = useMemo(() => {
    let list = dbServices;

    // Search query filter (Name, Description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query))
      );
    }

    // Filter by Active Chip
    if (activeFilterChip === 'Running') {
      const dbRunningIds = customerOrders
        .filter(
          (o) =>
            ['PENDING', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'CONFIRMED'].includes(o.orderStatus) ||
            o.revisions?.some(
              (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
            )
        )
        .map((o) => orderMainServiceId(o));

      list = list.filter(
        (s) => runningServiceIds.includes(s.id) || dbRunningIds.includes(s.id)
      );
    } else if (activeFilterChip === 'Unread') {
      // Strictly reflect real unread records from database for authenticated session
      list = list.filter((s) => {
        const conv = conversationByServiceId.get(s.id);
        return (conv?.unreadCount ?? 0) > 0;
      });
    } else if (activeFilterChip === 'Favorites') {
      list = list.filter((s: Service) => s.isPopular || Number(s.basePrice) >= 800);
    } else if (activeFilterChip === 'Save') {
      list = list.filter((s) => savedServiceIds.includes(s.id));
    } else if (activeFilterChip !== 'All') {
      // Check if it's a custom filter list
      const custom = customFilters.find(
        (f) => f.name === activeFilterChip || f.id === activeFilterChip
      );
      if (custom) {
        list = list.filter((s) => custom.serviceIds.includes(s.id));
      } else {
        // Customer category chips (Appliances, Digital, ...) filter by category name
        list = list.filter((s) => s.category?.name === activeFilterChip);
      }
    }

    // WhatsApp Standard: Sort conversations with Active Revisions first, then by latest chat activity
    list = [...list].sort((a, b) => {
      const aRev = customerOrders.some(
        (o) =>
          orderMainServiceId(o) === a.id &&
          o.revisions?.some(
            (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
          )
      );
      const bRev = customerOrders.some(
        (o) =>
          orderMainServiceId(o) === b.id &&
          o.revisions?.some(
            (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
          )
      );
      if (aRev && !bRev) return -1;
      if (!aRev && bRev) return 1;

      const timeA = serviceLastActivity[a.id] || 0;
      const timeB = serviceLastActivity[b.id] || 0;
      return timeB - timeA;
    });

    return list;
  }, [
    dbServices,
    searchQuery,
    activeFilterChip,
    savedServiceIds,
    customFilters,
    runningServiceIds,
    serviceLastActivity,
    customerOrders,
    conversationByServiceId,
  ]);

  // Top-bar category chips in the admin's order; a chip filters the list by its entries' category name.
  const categoryNames = useMemo(() => groups.map((group) => group.name), [groups]);

  return {
    dbServices,
    categoryNames,
    isServicesLoading,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    activeFilterChip,
    setActiveFilterChip,
    customFilters,
    savedServiceIds,
    createCustomFilter,
    deleteCustomFilter,
    toggleSaveService,
    isServiceSaved,
    isFilterModalOpen,
    setIsFilterModalOpen,
    filteredServices,
    userConversations,
    conversationByServiceId,
  };
}
