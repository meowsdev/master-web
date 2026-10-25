'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { servicesService } from '@/services/services.service';
import { ordersService } from '@/services/orders.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Service } from '@/types/service.types';
import { Order } from '@/types/order.types';
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
  const { isAuthenticated } = useAuthStore();
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

  // Fetch real services list from database backend
  const { data: dbServices = [], isLoading: isServicesLoading } = useQuery<Service[]>({
    queryKey: ['super-app-services'],
    queryFn: () => servicesService.getServices(),
  });

  // Fetch customer orders (shares cache with OrdersDrawer)
  const { data: customerOrders = [] } = useQuery<Order[]>({
    queryKey: ['my-orders-drawer'],
    queryFn: () => ordersService.getOrders(),
    enabled: isAuthenticated,
    staleTime: 10000,
  });

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
        .map((o) => o.serviceId);

      list = list.filter(
        (s) => runningServiceIds.includes(s.id) || dbRunningIds.includes(s.id)
      );
    } else if (activeFilterChip === 'Unread') {
      list = list.slice(0, 3);
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
      }
    }

    // WhatsApp Standard: Sort conversations with Active Revisions first, then by latest chat activity
    list = [...list].sort((a, b) => {
      const aRev = customerOrders.some(
        (o) =>
          o.serviceId === a.id &&
          o.revisions?.some(
            (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
          )
      );
      const bRev = customerOrders.some(
        (o) =>
          o.serviceId === b.id &&
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
  ]);

  return {
    dbServices,
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
  };
}
