import Link from 'next/link';
import { House, SearchX } from 'lucide-react';
import StatusPage, { primaryBtn } from '@/components/shared/StatusPage';

export const metadata = { title: 'Page not found | super app' };

export default function NotFound() {
  return (
    <StatusPage
      icon={SearchX}
      code="404"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
      actions={
        <Link href="/" className={primaryBtn}>
          <House className="h-4 w-4" aria-hidden /> Back to home
        </Link>
      }
    />
  );
}
