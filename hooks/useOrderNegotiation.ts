'use client';

import { toast } from 'sonner';
import { ordersService } from '@/services/orders.service';
import { apiClient } from '@/lib/axios';
import { PaymentStatus } from '@/types/order.types';
import { ChatMessage } from '@/types/super-app.types';

interface UseOrderNegotiationProps {
  activeServiceId: string | null;
  setServiceMessages: React.Dispatch<
    React.SetStateAction<Record<string, ChatMessage[]>>
  >;
  playWhatsAppChime?: () => void;
  userId?: string;
}

export function useOrderNegotiation({
  activeServiceId,
  setServiceMessages,
  playWhatsAppChime,
  userId,
}: UseOrderNegotiationProps) {
  // 1. FR-PAY: Handle Advance Payment
  const handlePayAdvance = async (
    messageId: string,
    orderId: string,
    amount: number
  ) => {
    try {
      await ordersService.updateOrder(orderId, {
        advancePaid: amount,
        paymentStatus: PaymentStatus.PARTIAL,
      });

      setServiceMessages((prev) => {
        if (!activeServiceId || !prev[activeServiceId]) return prev;
        return {
          ...prev,
          [activeServiceId]: prev[activeServiceId].map((msg) => {
            if (msg.id === messageId && msg.orderCard) {
              const totalPrice = Number(msg.orderCard.totalPrice || msg.orderCard.basePrice);
              return {
                ...msg,
                orderCard: {
                  ...msg.orderCard,
                  advancePaid: amount,
                  dueAmount: Math.max(0, totalPrice - amount),
                },
              };
            }
            return msg;
          }),
        };
      });

      playWhatsAppChime?.();
      toast.success(`৳${amount} অগ্রিম পেমেন্ট সফলভাবে সম্পন্ন হয়েছে! 🎉`);
    } catch {
      toast.error('অগ্রিম পেমেন্ট ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  // 2. FR-ORD: Accept New Price
  const handleAcceptPrice = async (messageId: string, orderId: string) => {
    try {
      await ordersService.acceptPrice(orderId);

      setServiceMessages((prev) => {
        if (!activeServiceId || !prev[activeServiceId]) return prev;
        return {
          ...prev,
          [activeServiceId]: prev[activeServiceId].map((msg) => {
            if (msg.id === messageId && msg.orderCard) {
              return {
                ...msg,
                orderCard: {
                  ...msg.orderCard,
                  hasPendingPriceEdit: false,
                },
              };
            }
            return msg;
          }),
        };
      });

      playWhatsAppChime?.();
      toast.success('নতুন বাজেট সফলভাবে অনুমোদিত হয়েছে! ✅');
    } catch {
      toast.error('বাজেট আপডেট গ্রহণে সমস্যা হয়েছে।');
    }
  };

  // 3. FR-ORD: Reject New Price
  const handleRejectPrice = async (messageId: string, orderId: string) => {
    try {
      await ordersService.rejectPrice(orderId);

      setServiceMessages((prev) => {
        if (!activeServiceId || !prev[activeServiceId]) return prev;
        return {
          ...prev,
          [activeServiceId]: prev[activeServiceId].map((msg) => {
            if (msg.id === messageId && msg.orderCard) {
              return {
                ...msg,
                orderCard: {
                  ...msg.orderCard,
                  hasPendingPriceEdit: false,
                  additionalPrice: 0,
                  totalPrice: msg.orderCard.basePrice,
                },
              };
            }
            return msg;
          }),
        };
      });

      toast.info('নতুন বাজেট বাতিল করে পূর্বের বাজেট বহাল রাখা হয়েছে।');
    } catch {
      toast.error('বাজেট বাতিল করতে সমস্যা হয়েছে।');
    }
  };

  // 4. FR-REV: Post-Revision Satisfaction Response (YES/NO)
  const handleSatisfactionResponse = async (
    messageId: string,
    orderId: string,
    continueWith: boolean
  ) => {
    try {
      await apiClient.post('/provider-reviews', {
        orderId,
        customerRating: continueWith ? 5 : 2,
        continueWithProvider: continueWith,
        reviewComment: continueWith
          ? 'Customer confirmed satisfaction and chose to continue.'
          : 'Customer dissatisfied after revision rework.',
      });

      setServiceMessages((prev) => {
        if (!activeServiceId || !prev[activeServiceId]) return prev;
        return {
          ...prev,
          [activeServiceId]: prev[activeServiceId].map((msg) => {
            if (msg.id === messageId && msg.orderCard) {
              return {
                ...msg,
                orderCard: {
                  ...msg.orderCard,
                  needsSatisfactionConfirmation: false,
                },
              };
            }
            return msg;
          }),
        };
      });

      if (continueWith) {
        toast.success('প্রোভাইডার আপনার বিশ্বস্ত পার্টনার হিসেবে সেভ করা হয়েছে! ⭐');
      } else {
        toast.warning('প্রোভাইডারকে আপনার অ্যাক্টিভ চ্যাট রুম থেকে স্বয়ংক্রিয়ভাবে রিমুভ করা হয়েছে।');
      }
    } catch {
      // Fallback local update
      setServiceMessages((prev) => {
        if (!activeServiceId || !prev[activeServiceId]) return prev;
        return {
          ...prev,
          [activeServiceId]: prev[activeServiceId].map((msg) => {
            if (msg.id === messageId && msg.orderCard) {
              return {
                ...msg,
                orderCard: {
                  ...msg.orderCard,
                  needsSatisfactionConfirmation: false,
                },
              };
            }
            return msg;
          }),
        };
      });
      if (continueWith) {
        toast.success('ধন্যবাদ আপনার মতামতের জন্য!');
      } else {
        toast.info('প্রোভাইডারকে অ্যাক্টিভ চ্যাট স্লট থেকে রিমুভ করা হলো।');
      }
    }
  };

  return {
    handlePayAdvance,
    handleAcceptPrice,
    handleRejectPrice,
    handleSatisfactionResponse,
  };
}
