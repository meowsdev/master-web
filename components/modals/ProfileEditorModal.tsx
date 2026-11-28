'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Logout01Icon, Notification01Icon, NotificationOff01Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { authService } from '@/services/auth.service';
import { User as UserType, UserRole } from '@/types/auth.types';
import { AuthDrawerShell } from '@/components/modals/auth/AuthDrawerShell';
import { ProfilePhoto, ProfileView } from '@/components/modals/profile/ProfileView';
import { CreateAccountForm, ProfileDraft } from '@/components/modals/auth/CreateAccountForm';
import { ProviderAreasSection } from '@/components/modals/profile/ProviderAreasSection';
import { ProviderSkillsSection } from '@/components/modals/profile/ProviderSkillsSection';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUserUpdated: (updatedUser: UserType) => void;
  isDarkMode: boolean;
  /** Shown as a "Log out" link under the form. */
  onLogout?: () => void;
  /** Message and order sounds on or off: one row above Log out. */
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

/*
 * The signed-in person's profile panel. It opens read-only (ProfileView: details, Edit button, completed
 * orders, rating, spent or earned, reviews). Editing uses the exact same panel and form as joining
 * (see AuthModal), pre-filled with the signed-in user's details.
 * The content is its own component so every open starts from fresh values.
 */
export function ProfileEditorModal({ isOpen, onClose, user, onUserUpdated, onLogout, soundEnabled, onToggleSound }: ProfileEditorModalProps) {
  if (!isOpen || !user) return null;
  return (
    <ProfileEditorContent key={user.id} user={user} onClose={onClose} onUserUpdated={onUserUpdated} onLogout={onLogout} soundEnabled={soundEnabled} onToggleSound={onToggleSound} />
  );
}

interface ProfileEditorContentProps {
  user: UserType;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserType) => void;
  onLogout?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

function ProfileEditorContent({ user, onClose, onUserUpdated, onLogout, soundEnabled, onToggleSound }: ProfileEditorContentProps) {
  // The panel opens on the read-only profile; Edit Profile switches to the form, and saving comes back here.
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // A picture chosen on the profile circle is uploaded and saved at once: no Save button.
  const changePhoto = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ছবি 5MB-এর বেশি হতে পারবে না');
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const url = await authService.uploadProfilePhoto(file);
      const updatedUser = await authService.completeProfile({ profilePhoto: url });
      onUserUpdated(updatedUser);
      toast.success('Profile photo updated');
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const message = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;
      toast.error(message || 'Profile photo could not be updated');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const logoutLink = onLogout && (
    <button
      type="button"
      onClick={() => {
        onClose();
        onLogout();
      }}
      className="flex h-[36px] cursor-pointer items-center gap-[6px] rounded-[10px] px-[12px] text-[14px] font-semibold text-[#d64545] transition-colors hover:bg-[#fdecec]"
    >
      <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={1.8} />
      Log out
    </button>
  );

  /*
   * The photo in the middle (one click changes it, in both modes) and, on its right under Log out, a small column:
   * the round icon that switches mode (a pencil to edit, a cross to leave the edit without saving) and under it the
   * sound switch: one round bell, crossed out when sound is off; pressing it turns sound on or off. The column fits beside the photo on phones too.
   */
  const avatarRow = (
    <div className="relative flex w-full justify-center">
      <ProfilePhoto photoUrl={user.profilePhoto ?? null} onPick={(file) => void changePhoto(file)} isUploading={isUploadingPhoto} />
      <div className="absolute right-0 top-0 flex flex-col items-end gap-[10px]">
        <button
          type="button"
          onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
          aria-label={mode === 'view' ? 'Edit profile' : 'Cancel editing'}
          title={mode === 'view' ? 'Edit profile' : 'Cancel'}
          className={`flex size-[40px] cursor-pointer items-center justify-center rounded-full transition-colors ${
            mode === 'view' ? 'bg-secondary/40 text-primary hover:bg-secondary' : 'bg-surface text-ink hover:bg-line'
          }`}
        >
          <HugeiconsIcon icon={mode === 'view' ? PencilEdit02Icon : Cancel01Icon} size={20} strokeWidth={1.8} />
        </button>
        {onToggleSound && (
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(soundEnabled)}
            aria-label="Sound notifications"
            title={soundEnabled ? 'Sound on' : 'Sound off'}
            onClick={onToggleSound}
            className={`flex size-[40px] cursor-pointer items-center justify-center rounded-full transition-colors ${
              soundEnabled ? 'bg-secondary/40 text-primary hover:bg-secondary' : 'bg-surface text-muted hover:bg-line'
            }`}
          >
            <HugeiconsIcon icon={soundEnabled ? Notification01Icon : NotificationOff01Icon} size={20} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  );

  if (mode === 'view') {
    return (
      <AuthDrawerShell title="My Profile" onClose={onClose} avatar={avatarRow} headerAction={logoutLink}>
        <ProfileView user={user} />
      </AuthDrawerShell>
    );
  }

  const handleSave = async (profile: ProfileDraft) => {
    setIsSaving(true);
    try {
      // The photo saves on its own the moment it is chosen, so Save sends only the fields.
      const updatedUser = await authService.completeProfile(profile);
      onUserUpdated(updatedUser);
      toast.success('Profile updated successfully! ✨');
      setMode('view');
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const message = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;
      toast.error(message || (err instanceof Error ? err.message : 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthDrawerShell title="Edit Profile" onClose={onClose} avatar={avatarRow} headerAction={logoutLink}>
      <CreateAccountForm
        phone={user.mobileNumber}
        initialValues={{
          fullName: user.name ?? '',
          username: user.username ?? '',
          districtId: user.districtId ?? null,
          upazilaId: user.upazilaId ?? null,
        }}
        isSaving={isSaving}
        onSave={(profile) => void handleSave(profile)}
      />

      {/* A provider also says here what they offer and where. Both save on their own buttons. */}
      {user.role === UserRole.PROVIDER && (
        <>
          <ProviderSkillsSection userId={user.id} />
          <ProviderAreasSection userId={user.id} />
        </>
      )}
    </AuthDrawerShell>
  );
}
