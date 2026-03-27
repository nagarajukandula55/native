import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const tokenExists = !!req.cookies.get("token")?.value;

  // Auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (tokenExists) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Public API / home
  if (pathname.startsWith("/api") || pathname === "/") return NextResponse.next();

  // Branding pages
  if (pathname.startsWith("/branding")) {
    if (!tokenExists) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // JWT verification done on frontend
    return NextResponse.next();
  }

  // Admin / account pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    if (!tokenExists) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/admin/:path*",
    "/account/:path*",
    "/branding/:path*",
  ],
};
