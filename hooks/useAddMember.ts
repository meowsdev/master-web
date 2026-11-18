'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { adminMembersService } from '@/services/admin-members.service';
import { useSupportChatStore } from '@/store/useSupportChatStore';
import { SupportMemberRole } from '@/types/support-chat.types';

const LABEL: Record<SupportMemberRole, string> = { PROVIDER: 'Provider', TECHNICIAN: 'Technician', CUSTOMER: 'Customer' };

/**
 * Form state for adding a provider, technician or customer. Rules (one role per number, a real district and
 * upazila pair, who may create technicians) live in the backend; this only gathers the fields and says what
 * is still missing. On success the new person is opened in the chat list.
 */
export function useAddMember(adminId: string, role: SupportMemberRole, onDone: () => void) {
  const queryClient = useQueryClient();
  const selectMember = useSupportChatStore((state) => state.select);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [providerProfileId, setProviderProfileId] = useState('');
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [upazilaId, setUpazilaId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const locations = useLocationOptions(districtId);

  const isNameRequired = role === 'TECHNICIAN';
  const missing = [
    !(phone !== '' && isValidPhoneNumber(phone)) && 'ফোন নম্বর',
    isNameRequired && !name.trim() && 'নাম',
    (districtId === null) !== (upazilaId === null) && 'উপজেলা',
  ].filter((field): field is string => Boolean(field));

  const selectDistrict = (next: number | null) => {
    setDistrictId(next);
    setUpazilaId(null);
  };

  const save = async () => {
    if (missing.length > 0 || isSaving) return;
    setIsSaving(true);
    try {
      let memberId: string;
      if (role === 'TECHNICIAN') {
        const technician = await adminMembersService.createTechnician({ mobileNumber: phone, name: name.trim(), ...(providerProfileId ? { providerAgencyId: providerProfileId } : {}) });
        memberId = technician.userId;
      } else {
        const created = await adminMembersService.createMember(role, {
          mobileNumber: phone,
          ...(name.trim() ? { name: name.trim() } : {}),
          ...(role === 'PROVIDER' && companyName.trim() ? { companyName: companyName.trim() } : {}),
          ...(districtId !== null && upazilaId !== null ? { districtId, upazilaId } : {}),
        });
        memberId = created.id;
      }
      void queryClient.invalidateQueries({ queryKey: ['support-directory', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      selectMember({ id: memberId, role, name: name.trim() || phone, roleLabel: LABEL[role], photo: null });
      toast.success(`${LABEL[role]} added`);
      onDone();
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? `Could not add the ${role.toLowerCase()}`);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    phone, setPhone, name, setName, companyName, setCompanyName,
    providerProfileId, setProviderProfileId,
    locations, districtId, selectDistrict, upazilaId, setUpazilaId,
    missing, isSaving, save,
  };
}
