'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, User, ShieldCheck, Check, Camera, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { User as UserType } from '@/types/auth.types';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUserUpdated: (updatedUser: UserType) => void;
  isDarkMode: boolean;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export function ProfileEditorModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  isDarkMode,
}: ProfileEditorModalProps) {
  const [fullName, setFullName] = useState(() => user?.name || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(() => user?.profilePhoto || null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showCustomPhotoInput, setShowCustomPhotoInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const bgModal = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const inputBg = isDarkMode
    ? 'bg-[#202c33] border-[#2f3b43] text-white focus:border-[#00a884]'
    : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21] focus:border-[#008069]';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (email.trim() && !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSaving(true);
      const photoToSave = customPhotoUrl.trim() || selectedPhoto || undefined;

      const updatedUser = await authService.completeProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        profilePhoto: photoToSave,
      });

      onUserUpdated(updatedUser);
      toast.success('Profile updated successfully! ✨');
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Failed to update profile');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${bgModal}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#008069] dark:text-[#25D366]" />
            <h3 className={`text-lg font-bold ${textPrimary}`}>Edit Profile</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} transition-colors cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Avatar Preview & Selection */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#008069] text-white flex items-center justify-center text-3xl font-black border-3 border-[#25D366] shadow-md">
                {(customPhotoUrl || selectedPhoto) ? (
                  <Image
                    src={customPhotoUrl || selectedPhoto!}
                    alt="Profile Avatar"
                    width={80}
                    height={80}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{fullName ? fullName[0].toUpperCase() : user.mobileNumber[0]}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowCustomPhotoInput(!showCustomPhotoInput)}
                className="absolute bottom-0 right-0 p-1.5 bg-[#008069] text-white rounded-full shadow-md hover:bg-[#25D366] transition-all cursor-pointer"
                title="Change Photo URL"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Avatar Presets */}
            <div className="space-y-1 text-center w-full">
              <p className={`text-xs font-medium ${textSecondary}`}>Choose an avatar or photo:</p>
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                {AVATAR_PRESETS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(presetUrl);
                      setCustomPhotoUrl('');
                    }}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer relative ${
                      selectedPhoto === presetUrl && !customPhotoUrl
                        ? 'border-[#25D366] ring-2 ring-[#25D366]/40 scale-105'
                        : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <Image src={presetUrl} alt={`Preset ${idx + 1}`} width={36} height={36} unoptimized className="object-cover w-full h-full" />
                    {selectedPhoto === presetUrl && !customPhotoUrl && (
                      <span className="absolute inset-0 bg-[#008069]/40 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input Accordion */}
            {showCustomPhotoInput && (
              <div className="w-full pt-1">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none transition-all ${inputBg}`}
                />
              </div>
            )}
          </div>

          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold ${textSecondary}`}>
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-medium transition-all ${inputBg}`}
              />
            </div>
            <p className={`text-[11px] ${textSecondary}`}>
              This name will be displayed in WhatsApp chats, counselor consults, and booking cards.
            </p>
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold ${textSecondary}`}>
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-medium transition-all ${inputBg}`}
              />
            </div>
            <p className={`text-[11px] ${textSecondary}`}>
              Used for electronic invoice receipts and booking summaries.
            </p>
          </div>

          {/* Phone Number (Read-only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold ${textSecondary}`}>Phone Number</label>
              <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                <Lock className="w-3 h-3" /> Permanent Identity
              </span>
            </div>
            <div
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border font-mono opacity-80 cursor-not-allowed ${
                isDarkMode ? 'bg-[#182229] border-[#222e35] text-[#8696a0]' : 'bg-gray-100 border-gray-200 text-gray-600'
              }`}
            >
              {user.mobileNumber}
            </div>
          </div>

          {/* Account Role Badge */}
          <div className="space-y-1.5">
            <label className={`block text-xs font-bold ${textSecondary}`}>Assigned Role</label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user.role} (Single Role Policy)
              </span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isDarkMode ? 'border-[#2f3b43] text-[#8696a0] hover:bg-white/5' : 'border-[#d1d7db] text-[#54656f] hover:bg-black/5'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] shadow-md shadow-[#25D366]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
