import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone(); // clone URL to modify safely
  const pathname = url.pathname;

  /* ================= AUTH PAGES ================= */
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      // Already logged in → redirect to default dashboard
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* ================= PUBLIC API / HOME ================= */
  if (pathname.startsWith("/api") || pathname === "/") {
    return NextResponse.next();
  }

  /* ================= BRANDING PAGES ================= */
  if (pathname.startsWith("/branding")) {
    if (!token) {
      url.pathname = "/login"; // not logged in → login page
      return NextResponse.redirect(url);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "branding") {
        url.pathname = "/unauthorized"; // wrong role → unauthorized
        return NextResponse.redirect(url);
      }
    } catch (err) {
      url.pathname = "/login"; // invalid token → login
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  /* ================= ADMIN / ACCOUNT PAGES ================= */
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

/* ===== MATCHER ===== */
export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/signup",
    "/branding/:path*", // all branding pages protected
  ],
};
