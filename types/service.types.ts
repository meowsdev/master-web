export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  isFixedPrice: boolean;
  basePrice: string | number;
  isActive: boolean;
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  isFixedPrice: boolean;
  basePrice: string | number;
  durationMin?: number | null;
  isActive: boolean;
  category?: ServiceCategory;
  createdAt: string;
  updatedAt: string;
}
