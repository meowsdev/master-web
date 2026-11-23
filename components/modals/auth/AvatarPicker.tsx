'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, Check } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

interface AvatarPickerProps {
  photoUrl: string | null;
  onChange: (photoUrl: string | null) => void;
}

/*
 * The 120px grey camera circle of the Figma design. In edit mode it shows the
 * current photo; clicking it reveals the same presets / custom URL choices the
 * old profile editor offered.
 */
export function AvatarPicker({ photoUrl, onChange }: AvatarPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-[16px]">
      <button
        type="button"
        onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
        aria-label="Change profile photo"
        className="relative flex size-[120px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface"
      >
        {photoUrl ? (
          <Image src={photoUrl} alt="Profile photo" width={120} height={120} unoptimized className="size-full object-cover" />
        ) : (
          <Camera className="size-[40px] text-ink" strokeWidth={1.5} />
        )}
      </button>

      {isPickerOpen && (
        <div className="w-full space-y-[12px]">
          <div className="flex flex-wrap items-center justify-center gap-[8px]">
            {AVATAR_PRESETS.map((presetUrl, index) => {
              const isSelected = photoUrl === presetUrl;
              return (
                <button
                  key={presetUrl}
                  type="button"
                  onClick={() => onChange(presetUrl)}
                  className={`relative size-[40px] cursor-pointer overflow-hidden rounded-full border-2 transition-all ${
                    isSelected ? 'border-primary' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image src={presetUrl} alt={`Preset ${index + 1}`} width={40} height={40} unoptimized className="size-full object-cover" />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/40">
                      <Check className="size-[14px] text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={photoUrl && !AVATAR_PRESETS.includes(photoUrl) ? photoUrl : ''}
            onChange={(event) => onChange(event.target.value.trim() || null)}
            className="w-full border-b border-line bg-transparent pb-[8px] text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary"
          />
        </div>
      )}
    </div>
  );
}
