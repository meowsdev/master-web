/**
 * The four-level catalog served by /catalog (backend CatalogService):
 * Category (top bar) -> Main service (chat list, one chat) -> Sub-service (card) -> Variant (priced option).
 */
import { PriceUnit } from './service.types';

export interface CatalogGroup {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  iconUrl?: string | null;
  mainServiceCount: number;
}

export interface RatingBrief {
  average: number | null;
  count: number;
}

export interface CatalogMainService {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  /** An emoji or a picture link. */
  iconUrl?: string | null;
  imageUrl?: string | null;
  isPopular: boolean;
  groupId: string | null;
  group: { id: string; name: string; nameBn?: string | null } | null;
  subServiceCount: number;
  startsFrom: number | null;
  rating?: RatingBrief;
  servedCount?: number;
}

export interface CatalogVariant {
  /** null only for an older sub-service with no option yet (its base price stands in; it cannot go in the cart). */
  id: string | null;
  name: string;
  nameBn?: string | null;
  imageUrl?: string | null;
  price: string | number;
  originalPrice?: string | number | null;
  priceUnit: PriceUnit;
  durationMin?: number | null;
}

export interface CatalogSubServiceCard {
  id: string;
  name: string;
  nameBn?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isPopular: boolean;
  variants: CatalogVariant[];
  startsFrom: number;
  startsFromOriginal: number | null;
  /** Whole-taka saving for the badge, null without a discount. */
  discount: number | null;
  rating: RatingBrief;
}

export interface CatalogMainServiceDetail extends Omit<CatalogMainService, 'subServiceCount' | 'startsFrom' | 'isPopular' | 'shortDescription'> {
  services: CatalogSubServiceCard[];
  /** The main service's own Overview, FAQ, How to order (never empty: the standard steps stand in) and Details. */
  included: string[];
  excluded: string[];
  howToOrder: string[];
  details?: string | null;
  faqs: CatalogFaq[];
}

export interface CatalogFaq {
  id: string;
  question: string;
  questionBn?: string | null;
  answer: string;
  answerBn?: string | null;
}

export interface CatalogReview {
  id: string;
  /** false: an admin hid it from the public (only staff lists carry hidden ones). */
  isPublic?: boolean;
  rating: number;
  comment?: string | null;
  createdAt: string;
  takenOn?: string | null;
  reviewerName: string;
  reviewerPicture?: string | null;
}

export interface CatalogReviewPage {
  summary: RatingBrief & { breakdown: [number, number, number, number, number] };
  page: number;
  pageSize: number;
  /** How many reviews the list holds in all (staff lists count hidden ones too). */
  totalItems?: number;
  items: CatalogReview[];
}

export interface CatalogSubServiceDetail {
  id: string;
  name: string;
  nameBn?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  priceUnit: PriceUnit;
  features: string[];
  categoryId: string;
  variants: CatalogVariant[];
  mainService: { id: string; name: string };
  overview: { included: string[]; excluded: string[] };
  faqs: CatalogFaq[];
  howToOrder: string[];
  details: string | null;
  /** The package's own notes or disclaimer (no fallback to the main service). */
  packageDetails?: string | null;
  servedCount: number;
  reviews: CatalogReviewPage;
}

/** One option in the cart, with what the card showed so the cart can draw itself without another request. */
export interface CartLine {
  variantId: string;
  subServiceId: string;
  subServiceName: string;
  variantName: string;
  unitPrice: number;
  priceUnit: PriceUnit;
  quantity: number;
  imageUrl?: string | null;
}

export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REPLACED';

export interface OrderQuote {
  id: string;
  orderId: string;
  requestedById: string;
  items: Array<{ label: string; amount: number }>;
  totalAmount: string | number;
  note?: string | null;
  status: QuoteStatus;
  respondedAt?: string | null;
  createdAt: string;
}
