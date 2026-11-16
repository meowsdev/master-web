'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderPlacementService } from '@/services/order-placement.service';
import { OrderAnswer, PlaceOrderRequest } from '@/types/order-placement.types';
import { Order } from '@/types/order.types';
import { useLocationOptions } from '@/hooks/useLocationOptions';

interface UsePlaceOrderFormArgs {
  initialServiceId: string | null;
  onPlaced: (order: Order) => void;
}

/** Form state for the Place Order panel. Prices come from the backend; nothing is calculated here. */
export function usePlaceOrderForm({ initialServiceId, onPlaced }: UsePlaceOrderFormArgs) {
  // null = the customer has not chosen yet, so the opening service (if any) applies.
  const [categoryChoice, setCategoryChoice] = useState<string | null>(null);
  const [subServiceChoice, setSubServiceChoice] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  // questionId -> chosen option and how many units it applies to
  const [answers, setAnswers] = useState<Record<string, OrderAnswer>>({});
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [upazilaId, setUpazilaId] = useState<number | null>(null);
  const [addressDetail, setAddressDetail] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locations = useLocationOptions(districtId);

  // Public reference data, the same for every visitor, so no user id in the key.
  const { data: catalog } = useQuery({
    queryKey: ['order-catalog'],
    queryFn: orderPlacementService.getCatalog,
    staleTime: 60_000,
  });

  const openingCategoryId = catalog?.categories.find((category) =>
    category.services.some((service) => service.id === initialServiceId),
  )?.id;
  const categoryId = categoryChoice ?? openingCategoryId ?? null;
  const category = catalog?.categories.find((item) => item.id === categoryId);
  // The opening sub-service only applies while the customer stays in its main service.
  const subServiceId = subServiceChoice ?? (categoryChoice === null ? initialServiceId : null);
  const subService = category?.services.find((item) => item.id === subServiceId);
  const effectiveQuantity = subService?.isCountable ? quantity : 1;
  const answerList = useMemo(() => Object.values(answers), [answers]);

  const { data: quote } = useQuery({
    queryKey: ['order-quote', subService?.id, effectiveQuantity, answerList],
    queryFn: () =>
      orderPlacementService.getQuote({ serviceId: subService!.id, quantity: effectiveQuantity, answers: answerList }),
    enabled: Boolean(subService),
    staleTime: 30_000,
    retry: false,
  });

  const selectCategory = (nextCategoryId: string) => {
    setCategoryChoice(nextCategoryId);
    setSubServiceChoice(null);
    setQuantity(1);
    setAnswers({});
  };

  const selectSubService = (nextSubServiceId: string) => {
    setSubServiceChoice(nextSubServiceId);
    setQuantity(1);
    setAnswers({});
  };

  const selectDistrict = (nextDistrictId: number | null) => {
    setDistrictId(nextDistrictId);
    setUpazilaId(null);
  };

  const setAnswer = (answer: OrderAnswer | null, questionId: string) =>
    setAnswers((previous) => {
      const next = { ...previous };
      if (answer) next[questionId] = answer;
      else delete next[questionId];
      return next;
    });

  const isReady = Boolean(
    subService && districtId && upazilaId && addressDetail.trim() && scheduledDate && timeSlot,
  );

  const submit = async () => {
    if (!isReady || !subService || !districtId || !upazilaId) return;
    setIsSubmitting(true);
    try {
      const request: PlaceOrderRequest = {
        serviceId: subService.id,
        quantity: effectiveQuantity,
        answers: answerList,
        description: description.trim() || undefined,
        districtId,
        upazilaId,
        addressDetail: addressDetail.trim(),
        scheduledDate,
        timeSlot,
      };
      const { order } = await orderPlacementService.placeOrder(request);
      onPlaced(order);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message || 'Could not place the order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    catalog, category, categoryId, selectCategory,
    subService, subServiceId: subService?.id ?? '', selectSubService,
    quantity: effectiveQuantity, setQuantity,
    description, setDescription,
    answers, setAnswer,
    locations, districtId, selectDistrict, upazilaId, setUpazilaId,
    addressDetail, setAddressDetail,
    scheduledDate, setScheduledDate, timeSlot, setTimeSlot,
    quote, isReady, isSubmitting, submit,
  };
}
