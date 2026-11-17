'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { IconGrid } from './IconGrid';

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
 * The picture of a service or main service: either an image the admin uploads, or an icon from Hugeicons.
 * Both end up as one link, so the rest of the app shows them the same way.
 */
export function PicturePicker({ value, onChange }: PicturePickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isIconGridOpen, setIsIconGridOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const run = async (save: () => Promise<string>) => {
    setIsBusy(true);
    try {
      onChange(await save());
      setIsIconGridOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const buttonClass = 'cursor-pointer rounded-[8px] border border-[#cecece] bg-white px-[12px] py-[7px] text-[13px] font-semibold text-[#202939] hover:bg-[#f7f5f3] disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="pt-[22px]">
      <div className="flex items-center gap-[14px]">
        <span className="flex size-[64px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a9e5cf] text-[28px]">
          {value && isImageSource(value) ? (
            // eslint-disable-next-line @next/next/no-img-element -- picture links come from the backend's uploads or any host
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span aria-hidden>{value || '＋'}</span>
          )}
        </span>

        <div className="flex flex-wrap gap-[8px]">
          <button type="button" disabled={isBusy} onClick={() => fileInput.current?.click()} className={buttonClass}>Upload image</button>
          <button type="button" disabled={isBusy} onClick={() => setIsIconGridOpen((wasOpen) => !wasOpen)} className={buttonClass} aria-expanded={isIconGridOpen}>Choose icon</button>
          {value && <button type="button" disabled={isBusy} onClick={() => onChange('')} className={`${buttonClass} text-[#d64545]`}>Remove</button>}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) run(() => adminService.uploadServicePicture(file));
          }}
        />
      </div>

      {isIconGridOpen && <IconGrid isBusy={isBusy} onChoose={(name, elements) => run(() => adminService.saveHugeicon(name, elements))} />}
    </div>
  );
}
