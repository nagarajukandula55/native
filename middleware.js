import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  /* ================= AUTH PAGES ================= */
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      // 🔥 Already logged in → send to default dashboard
      return NextResponse.redirect(new URL("/", req.url));
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

    // 🔥 ONLY check token existence (no verify here)
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

/* ===== MATCHER ===== */
export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/signup"],
};
