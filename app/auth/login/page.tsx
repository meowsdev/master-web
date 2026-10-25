'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Single Unified WhatsApp Login:
 * Redirects legacy /auth/login route directly to the main WhatsApp Web desktop interface.
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]">
      <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
