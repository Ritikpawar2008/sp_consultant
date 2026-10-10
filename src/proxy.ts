import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "./lib/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We only protect /admin and its subroutes, except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await decrypt(sessionCookie);
      // Valid token, proceed
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // If user is logged in and visits /admin/login, redirect to /admin
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (sessionCookie) {
      try {
        await decrypt(sessionCookie);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch (error) {
        // Invalid token, do nothing, allow them to view login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
