import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  /* ================= AUTH PAGES ================= */
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 Redirect logged-in users away from login/signup
        if (decoded.role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        if (decoded.role === "store") {
          return NextResponse.redirect(new URL("/admin/store/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/account", req.url));

      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  /* ================= PUBLIC ================= */
  if (
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  /* ================= PROTECTED ================= */
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      /* ===== ROLE CONTROL ===== */

      // ADMIN + STORE
      if (pathname.startsWith("/admin")) {
        if (decoded.role !== "admin" && decoded.role !== "store") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      // USER ONLY
      if (pathname.startsWith("/account")) {
        if (decoded.role !== "user") {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      return NextResponse.next();

    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

/* ===== MATCHER ===== */
export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/signup"],
};
