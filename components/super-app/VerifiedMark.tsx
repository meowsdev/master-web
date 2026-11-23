import Image from 'next/image';

/* The brand "completed / verified" mark (public/chat-list/verify-icon.svg): dark badge, white border, white seal. */
export function VerifiedMark({ size = 20 }: { size?: number }) {
  return <Image src="/chat-list/verify-icon.svg" alt="" width={size} height={size} className="shrink-0" />;
}
