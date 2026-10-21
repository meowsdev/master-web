'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/services/services.service';
import { Service } from '@/types/service.types';
import { FilterChip } from '@/types/super-app.types';

/**
 * Hook to manage backend service fetching, search query filtering,
 * and WhatsApp Web filter chip states.
 */
export function useServicesFilter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilterChip, setActiveFilterChip] = useState<FilterChip>('All');

  // Fetch real services list from database backend
  const { data: dbServices = [], isLoading: isServicesLoading } = useQuery<Service[]>({
    queryKey: ['super-app-services'],
    queryFn: () => servicesService.getServices(),
  });

  // Filtered services based on search query and active filter chip
  const filteredServices = useMemo(() => {
    let list = dbServices;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          (s.category?.name && s.category.name.toLowerCase().includes(query))
      );
    }

    if (activeFilterChip === 'Unread') {
      list = list.slice(0, 3);
    } else if (activeFilterChip === 'Favorites') {
      list = list.filter((s: any) => s.isPopular || s.basePrice >= 800);
    } else if (activeFilterChip === 'Groups') {
      list = list.filter(
        (s) =>
          s.category?.name?.toLowerCase().includes('clean') ||
          s.name.toLowerCase().includes('ac') ||
          s.name.toLowerCase().includes('install')
      );
    }

    return list;
  }, [dbServices, searchQuery, activeFilterChip]);

  return {
    dbServices,
    isServicesLoading,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    activeFilterChip,
    setActiveFilterChip,
    filteredServices,
  };
}
