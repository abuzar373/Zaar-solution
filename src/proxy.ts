import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "abuzar_admin_token";

/**
* Edge-safe route guard (Next.js 16 "proxy" convention, formerly middleware). We only check for the PRESENCE of the session cookie here
 * (the Edge runtime has no node:crypto), so the redirect happens server-side
 * with no loading flash. Full signature + role verification still happens in
 * `requireAdmin()` on every protected API route and in /api/auth/me.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasCookie = Boolean(req.cookies.get(AUTH_COOKIE)?.value);

  if (pathname.startsWith("/admin") && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
