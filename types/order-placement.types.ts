/**
 * Shapes of the Place Order catalog served by the backend. Hierarchy:
 * main service (category) -> sub-service ("problem") -> follow-up questions.
 * Admins own every price and every "countable" flag.
 */
export interface OrderSubService {
  id: string;
  name: string;
  nameBn?: string | null;
  /** The service's own photo; absent until an admin uploads one. */
  imageUrl?: string | null;
  basePrice: string | number;
  /** Derived by the backend from the price unit: true when the customer also picks a quantity. */
  isCountable: boolean;
  maxQuantity: number;
}

export interface OrderFormOption {
  id: string;
  label: string;
  labelBn?: string | null;
  unitPrice: string | number;
  isCountable: boolean;
}

export interface OrderFormQuestion {
  id: string;
  text: string;
  textBn?: string | null;
  options: OrderFormOption[];
}

export interface OrderMainService {
  id: string;
  name: string;
  /** An emoji or an image URL. */
  iconUrl?: string | null;
  services: OrderSubService[];
  questions: OrderFormQuestion[];
}

export interface OrderCatalog {
  timeSlots: string[];
  categories: OrderMainService[];
}

export interface OrderAnswer {
  questionId: string;
  optionId: string;
  count: number;
}

export interface QuoteRequest {
  /** The chosen sub-service. */
  serviceId: string;
  quantity: number;
  answers: OrderAnswer[];
}

export interface PlaceOrderRequest extends QuoteRequest {
  description?: string;
  districtId: number;
  upazilaId: number;
  addressDetail: string;
  /** YYYY-MM-DD */
  scheduledDate: string;
  timeSlot: string;
}

export interface PriceLine {
  label: string;
  unitPrice: number;
  count: number;
  amount: number;
}

export interface PriceQuote {
  lines: PriceLine[];
  total: number;
}
