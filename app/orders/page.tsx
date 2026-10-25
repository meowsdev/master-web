'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects legacy /orders page directly into the WhatsApp Web interface
 * where the OrdersDrawer opens natively without any external Navbar.
 */
export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?view=orders');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#efeae2] dark:bg-[#0b141a]">
      <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
