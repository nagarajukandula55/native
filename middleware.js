import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value || "";
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  /* ================= AUTH PAGES ================= */
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      // already logged in → redirect based on role
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === "branding") url.pathname = "/branding/dashboard";
        else if (decoded.role === "store") url.pathname = "/admin/store/dashboard";
        else if (decoded.role === "admin") url.pathname = "/admin";
        else url.pathname = "/account";
      } catch {
        url.pathname = "/login";
      }
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* ================= PUBLIC ================= */
  if (pathname.startsWith("/api") || pathname === "/") {
    return NextResponse.next();
  }

  /* ================= BRANDING ================= */
  if (pathname.startsWith("/branding")) {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "branding") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Default redirect for /branding → /branding/dashboard
      if (pathname === "/branding") {
        url.pathname = "/branding/dashboard";
        return NextResponse.redirect(url);
      }

    } catch (err) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  /* ================= ADMIN / ACCOUNT ================= */
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
    "/branding/:path*",
    "/branding", // redirect /branding → /branding/dashboard
  ],
};
