'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { servicesService } from '@/services/services.service';
import { Service } from '@/types/service.types';
import { FilterChip, CustomFilterList } from '@/types/super-app.types';

const STORAGE_KEY_CUSTOM_FILTERS = 'superapp_custom_filters_v1';
const STORAGE_KEY_SAVED_SERVICES = 'superapp_saved_services_v1';

/**
 * Hook to manage backend service fetching, search query filtering,
 * WhatsApp Web filter chip states (All, Unread, Favorites, Save),
 * and dynamic user-created custom filter lists.
 */
export function useServicesFilter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilterChip, setActiveFilterChip] = useState<FilterChip>('All');
  const [customFilters, setCustomFilters] = useState<CustomFilterList[]>([]);
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Load custom filters and saved services from localStorage on client mount
  useEffect(() => {
    try {
      const storedFilters = localStorage.getItem(STORAGE_KEY_CUSTOM_FILTERS);
      if (storedFilters) {
        setCustomFilters(JSON.parse(storedFilters));
      }
      const storedSaved = localStorage.getItem(STORAGE_KEY_SAVED_SERVICES);
      if (storedSaved) {
        setSavedServiceIds(JSON.parse(storedSaved));
      }
    } catch (e) {
      console.error('Failed to load filters from localStorage', e);
    }
  }, []);

  // Fetch real services list from database backend
  const { data: dbServices = [], isLoading: isServicesLoading } = useQuery<Service[]>({
    queryKey: ['super-app-services'],
    queryFn: () => servicesService.getServices(),
  });

  // Seed default saved services if empty once dbServices load
  useEffect(() => {
    if (dbServices.length > 0 && savedServiceIds.length === 0) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_SAVED_SERVICES);
        if (!stored) {
          // Pre-save the first 2 popular services as initial items
          const initialSaved = dbServices.slice(0, 2).map((s) => s.id);
          setSavedServiceIds(initialSaved);
          localStorage.setItem(STORAGE_KEY_SAVED_SERVICES, JSON.stringify(initialSaved));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [dbServices, savedServiceIds.length]);

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
    if (activeFilterChip === 'Unread') {
      list = list.slice(0, 3);
    } else if (activeFilterChip === 'Favorites') {
      list = list.filter((s: any) => s.isPopular || s.basePrice >= 800);
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

    return list;
  }, [dbServices, searchQuery, activeFilterChip, savedServiceIds, customFilters]);

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
