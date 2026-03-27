import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  /* ================= AUTH PAGES ================= */
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      // Already logged in → send to default dashboard
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  /* ================= PUBLIC PAGES ================= */
  if (pathname.startsWith("/api") || pathname === "/") {
    return NextResponse.next();
  }

  /* ================= BRANDING PAGES ================= */
  if (pathname.startsWith("/branding")) {
    if (!token) {
      // Not logged in → redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Only allow "branding" role
      if (decoded.role !== "branding") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

    } catch (err) {
      // Invalid token → redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  /* ================= PROTECTED ADMIN / ACCOUNT ================= */
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Optional: you can verify token here for extra security
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
    "/branding/:path*", // Branding dashboard & labels
  ],
};
