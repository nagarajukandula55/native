import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value || "";
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  /* ================= AUTH PAGES ================= */
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Redirect logged-in users based on role
        switch (decoded.role) {
          case "branding":
            url.pathname = "/branding/dashboard";
            break;
          case "store":
            url.pathname = "/admin/store/dashboard";
            break;
          case "admin":
            url.pathname = "/admin";
            break;
          default:
            url.pathname = "/account";
        }
        return NextResponse.redirect(url);
      } catch {
        // Invalid token → continue to login
        return NextResponse.next();
      }
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
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "branding") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Redirect only /branding (not /branding/dashboard)
      if (pathname === "/branding") {
        url.pathname = "/branding/dashboard";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
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
    "/login",
    "/signup",
    "/admin/:path*",
    "/account/:path*",
    "/branding",
    "/branding/:path*",
  ],
};
