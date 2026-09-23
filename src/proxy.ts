import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PANEL_ROUTES = [
  "/panel/login",
  "/panel/register",
  "/panel/init",
];

/**
 * Next 16 middleware entry (proxy.ts, not middleware.ts).
 * Cheap cookie presence check; full session validation happens in
 * `panel/(protected)/layout.tsx` against D1.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get("gg_session")?.value);

  if (PUBLIC_PANEL_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  if (!hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
