import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "abuzar_admin_token";

/**
 * Edge-safe route guard (Next.js 16 "proxy" convention, formerly middleware).
 *
 * It ONLY blocks /admin when there is no session cookie at all. It deliberately
 * does NOT redirect /login → /admin, because the Edge runtime cannot verify the
 * cookie's signature (no node:crypto). Doing so caused an infinite loop with a
 * stale or invalid cookie:
 *
 *   /admin  → cookie present → allowed → server layout rejects → /login
 *   /login  → cookie present → redirected back to /admin → loop forever
 *
 * The browser showed ERR_TOO_MANY_REDIRECTS. Full verification now happens in
 * the admin layout (server side) and in requireAdmin() on every API route,
 * while the login page redirects an already-signed-in admin on the client.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const hasCookie = Boolean(req.cookies.get(AUTH_COOKIE)?.value);
    if (!hasCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
