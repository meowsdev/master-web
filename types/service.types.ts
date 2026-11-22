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
  _count?: {
    services?: number;
  };
  createdAt: string;
  updatedAt: string;
}

/** Provider preview computed by the backend for the customer chat list. */
export interface ServiceProviderSummary {
  providerCount: number;
  /** Best-rated providers first, capped by the backend. */
  providerNames: string[];
  /** null while no assigned provider has been rated yet. */
  averageRating: number | null;
}

export type PriceUnit = 'FIXED' | 'PER_UNIT' | 'PER_SQFT';

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  /** Bengali title shown on the public service page. */
  nameBn?: string | null;
  imageUrl?: string | null;
  /** Bullet list on the public service page ("Basic servicing", ...). */
  features?: string[];
  description?: string | null;
  isFixedPrice: boolean;
  /** FIXED = not countable; PER_UNIT / PER_SQFT = the customer picks how many. */
  priceUnit?: PriceUnit;
  isPopular?: boolean;
  isFeatured?: boolean;
  orderCount?: number;
  basePrice: string | number;
  durationMin?: number | null;
  isActive: boolean;
  category?: ServiceCategory;
  providerSummary?: ServiceProviderSummary;
  createdAt: string;
  updatedAt: string;
}
