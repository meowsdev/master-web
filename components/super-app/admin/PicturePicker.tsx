'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Camera01Icon } from '@hugeicons/core-free-icons';
import { adminService } from '@/services/admin.service';

const isImageSource = (value: string) => /^(https?:)?\//.test(value);

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'The picture could not be saved';
};

interface PicturePickerProps {
  /** The stored picture: a link, an old emoji, or empty. */
  value: string;
  onChange: (value: string) => void;
}

/*
 * The picture of a service or main service, like the profile photo: a 120px grey camera circle. Pressing it uploads
 * an image; the circle then shows it. Pictures saved before (old icons included) keep showing as they are.
 */
export function PicturePicker({ value, onChange }: PicturePickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  const upload = async (file: File) => {
    setIsBusy(true);
    try {
      onChange(await adminService.uploadServicePicture(file));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-[8px] pt-[22px]">
      <button
        type="button"
        disabled={isBusy}
        onClick={() => fileInput.current?.click()}
        aria-label={value ? 'Change picture' : 'Upload picture'}
        className="relative flex size-[120px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface text-[44px] disabled:cursor-wait"
      >
        {value && isImageSource(value) ? (
          // eslint-disable-next-line @next/next/no-img-element -- picture links come from the backend's uploads or any host
          <img src={value} alt="" className="size-full object-cover" />
        ) : value ? (
          <span aria-hidden>{value}</span>
        ) : (
          <HugeiconsIcon icon={Camera01Icon} size={40} strokeWidth={1.5} className="text-ink" />
        )}
        {isBusy && <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-[13px] font-semibold text-white">Uploading...</span>}
      </button>

      {value && (
        <button type="button" disabled={isBusy} onClick={() => onChange('')} className="cursor-pointer text-[13px] font-semibold text-[#d64545] disabled:cursor-not-allowed disabled:opacity-50">
          Remove picture
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
