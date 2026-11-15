/**
 * Where to send the user after signing in: the page they were bounced from
 * (`?next=/orders/123`), or home. Only same-site paths are accepted, so a
 * crafted link can't turn the login into an open redirect.
 */
export function getPostAuthRedirectPath(search: string = typeof window === 'undefined' ? '' : window.location.search): string {
  const next = new URLSearchParams(search).get('next');
  if (!next) return '/';
  // Must be a plain path on this site: "/x", never "//host", "/\host" or "https://...".
  const isSameSitePath = next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\');
  return isSameSitePath ? next : '/';
}
