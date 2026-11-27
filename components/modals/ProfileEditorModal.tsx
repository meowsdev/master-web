'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { User as UserType, UserRole } from '@/types/auth.types';
import { AuthDrawerShell, authLinkClass } from '@/components/modals/auth/AuthDrawerShell';
import { ProfilePhoto, ProfileView } from '@/components/modals/profile/ProfileView';
import { AvatarPicker } from '@/components/modals/auth/AvatarPicker';
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(user.profilePhoto ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const logoutLink = onLogout && (
    <button
      type="button"
      onClick={() => {
        onClose();
        onLogout();
      }}
      className="cursor-pointer text-[14px] font-semibold text-[#d64545] hover:underline"
    >
      Log out
    </button>
  );

  if (mode === 'view') {
    return (
      <AuthDrawerShell title="My Profile" onClose={onClose} avatar={<ProfilePhoto photoUrl={user.profilePhoto ?? null} />}>
        <ProfileView
          user={user}
          onEdit={() => {
            // Every edit starts from what is saved now.
            setPhotoUrl(user.profilePhoto ?? null);
            setMode('edit');
          }}
        />
        {onToggleSound && (
          <div className="mb-[16px] flex items-center justify-between rounded-[12px] border border-line bg-white px-[14px] py-[12px]">
            <span className="text-[14px] font-semibold text-ink">Sound Notifications</span>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(soundEnabled)}
              aria-label="Sound Notifications"
              onClick={onToggleSound}
              className="relative h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full"
            >
              <span className={`absolute inset-0 rounded-full transition-colors ${soundEnabled ? 'bg-primary' : 'bg-muted/40'}`} />
              <span className={`absolute top-[3px] size-[16px] rounded-full bg-white shadow transition-all ${soundEnabled ? 'left-[21px]' : 'left-[3px]'}`} />
            </button>
          </div>
        )}
        {logoutLink}
      </AuthDrawerShell>
    );
  }

  const handleSave = async (profile: ProfileDraft) => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.completeProfile({
        ...profile,
        profilePhoto: photoUrl ?? undefined,
      });
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
    <AuthDrawerShell
      title="Edit Profile"
      onClose={onClose}
      avatar={<AvatarPicker photoUrl={photoUrl} onChange={setPhotoUrl} />}
    >
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
        hasExtraChanges={photoUrl !== (user.profilePhoto ?? null)}
      />

      {/* A provider also says here what they offer and where. Both save on their own buttons. */}
      {user.role === UserRole.PROVIDER && (
        <>
          <ProviderSkillsSection userId={user.id} />
          <ProviderAreasSection userId={user.id} />
        </>
      )}

      <button type="button" onClick={() => setMode('view')} className={authLinkClass}>
        ← Back to profile
      </button>
    </AuthDrawerShell>
  );
}
