import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Any one of these means "this browser has a session":
//  - access_token: valid short-term credential,
//  - refresh_token: only visible when the API shares this host and path,
//  - session_active: marker the API sets next to the refresh cookie, because
//    the refresh cookie itself is path-scoped to /api/v1/auth and therefore
//    never reaches this proxy.
// An expired access token alone must NOT bounce the user: the client refreshes
// silently on its first 401, so the proxy only blocks browsers with no session.
const SESSION_COOKIES = ['access_token', 'refresh_token', 'session_active'];

export function proxy(request: NextRequest) {
  // Guests may open the booking form; it asks them to log in on submit.
  if (request.nextUrl.pathname === '/orders/new') return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();

  // The login surface of this app is the main screen (AuthModal on `/`).
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: ['/provider/:path*', '/orders/:path+'],
};
