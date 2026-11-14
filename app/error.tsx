'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { House, RefreshCw, TriangleAlert } from 'lucide-react';
import StatusPage, {
  primaryBtn,
  secondaryBtn,
} from '@/components/shared/StatusPage';

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      icon={TriangleAlert}
      title="Something went wrong"
      description="An unexpected error occurred. Please try again, or go back to the home page."
      footnote={error.digest ? `Reference: ${error.digest}` : undefined}
      actions={
        <>
          <button type="button" onClick={() => retry()} className={primaryBtn}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Try again
          </button>
          <Link href="/" className={secondaryBtn}>
            <House className="h-4 w-4" aria-hidden /> Home
          </Link>
        </>
      }
    />
  );
}
