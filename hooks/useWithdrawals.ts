'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminWithdrawalsService, providerWalletService } from '@/services/provider-wallet.service';
import { NewWithdrawal, WithdrawalStatus } from '@/types/provider-earnings.types';

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) ?? fallback;
};

/* Keys carry the user id, so a signed-out user's money never reaches the next one. */

/** The provider's own withdrawals: the list, asking for one, taking one back. Each change refreshes the earnings card and the due. */
export function useMyWithdrawals(userId: string) {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['provider-withdrawals', userId] });
    void queryClient.invalidateQueries({ queryKey: ['provider-earnings', userId] });
    void queryClient.invalidateQueries({ queryKey: ['provider-wallet', userId] });
  };

  const list = useQuery({ queryKey: ['provider-withdrawals', userId], queryFn: providerWalletService.listWithdrawals, refetchInterval: 30000 });

  const request = useMutation({
    mutationFn: (input: NewWithdrawal) => providerWalletService.requestWithdrawal(input),
    onSuccess: () => {
      refresh();
      toast.success('উইথড্র রিকোয়েস্ট পাঠানো হয়েছে');
    },
    onError: (error) => toast.error(errorMessage(error, 'রিকোয়েস্ট পাঠানো যায়নি')),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => providerWalletService.cancelWithdrawal(id),
    onSuccess: () => {
      refresh();
      toast.success('রিকোয়েস্ট বাতিল হয়েছে, টাকা ব্যালেন্সে ফিরে এসেছে');
    },
    onError: (error) => toast.error(errorMessage(error, 'বাতিল করা যায়নি')),
  });

  return { list, request, cancel };
}

/** Admin: withdrawal requests by status, and marking one paid or rejected. */
export function useAdminWithdrawals(adminId: string, status?: WithdrawalStatus) {
  const queryClient = useQueryClient();
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin-withdrawals', adminId] });

  const list = useQuery({ queryKey: ['admin-withdrawals', adminId, status ?? 'ALL'], queryFn: () => adminWithdrawalsService.list(status), refetchInterval: 30000 });

  const markPaid = useMutation({
    mutationFn: ({ id, transactionRef, note }: { id: string; transactionRef: string; note?: string }) => adminWithdrawalsService.markPaid(id, transactionRef, note),
    onSuccess: () => {
      refresh();
      toast.success('Paid হিসেবে মার্ক করা হয়েছে');
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not mark it paid')),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminWithdrawalsService.reject(id, reason),
    onSuccess: () => {
      refresh();
      toast.success('রিজেক্ট করা হয়েছে, টাকা পার্টনারের ব্যালেন্সে ফিরে গেছে');
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not reject it')),
  });

  return { list, markPaid, reject };
}
