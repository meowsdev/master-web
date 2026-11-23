import { CatalogMainService } from '@/types/catalog.types';
import { ChatSession } from '@/types/chat.types';
import { Order } from '@/types/order.types';
import { Service } from '@/types/service.types';

/**
 * The customer's chat list holds main services (AC Servicing, AC Doctor, ...), one chat each. The chat machinery
 * (selection, header, order tabs) was built around a `Service`, so each main service is presented as one whose id
 * and categoryId are both the main service id, and whose category name is its top-bar category (for the chips).
 */
export function mainServiceToEntry(main: CatalogMainService): Service {
  const now = new Date(0).toISOString();
  return {
    id: main.id,
    categoryId: main.id,
    name: main.name,
    description: main.shortDescription || main.description || null,
    imageUrl: main.imageUrl ?? null,
    isFixedPrice: false,
    isPopular: main.isPopular,
    basePrice: main.startsFrom ?? 0,
    isActive: true,
    isMainService: true,
    groupId: main.groupId,
    servedCount: main.servedCount ?? 0,
    orderCount: main.servedCount ?? 0,
    category: {
      id: main.id,
      name: main.group?.name ?? '',
      slug: main.slug,
      iconUrl: main.iconUrl ?? null,
      isFixedPrice: false,
      basePrice: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    providerSummary: { providerCount: 0, providerNames: [], averageRating: main.rating?.average ?? null },
    createdAt: now,
    updatedAt: now,
  };
}

/** The main service (chat) an order is a tab of. */
export const orderMainServiceId = (order: Pick<Order, 'categoryId' | 'service'>): string | undefined =>
  order.categoryId ?? order.service?.categoryId ?? undefined;

/** The main service a chat belongs to (older sessions only carry their service). */
export const conversationMainServiceId = (conversation: Pick<ChatSession, 'categoryId' | 'serviceId'>) =>
  conversation.categoryId ?? conversation.serviceId;
