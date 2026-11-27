'use client';

import { useEffect, useState } from 'react';
import { providerKycService } from '@/services/provider-kyc.service';

/*
 * A private KYC picture (NID side or the provider's photo). It is fetched with the login and shown from memory,
 * so the picture never has a public address; the memory is freed when the picture leaves the screen.
 */
export function KycImage({ fileKey, alt, className = '' }: { fileKey: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let isCurrent = true;
    providerKycService
      .fileBlob(fileKey)
      .then((blob) => {
        if (!isCurrent) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => isCurrent && setFailed(true));
    return () => {
      isCurrent = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileKey]);

  if (failed) return <div className={`flex items-center justify-center bg-surface text-[12px] font-medium text-muted ${className}`}>ছবি আনা যায়নি</div>;
  if (!src) return <div className={`animate-pulse bg-surface ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element -- an in-memory blob, not a URL Next can optimise
  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
}
