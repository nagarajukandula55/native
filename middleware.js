import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;

  /* ================= PUBLIC ================= */
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return NextResponse.next();
  }

  /* ================= NO TOKEN ================= */
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ================= VERIFY ================= */
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ================= ROLE ================= */

  // 🔥 STORE FIRST (IMPORTANT)
  if (pathname.startsWith("/admin/store")) {
    if (role !== "store") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // ADMIN
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // USER
  if (pathname.startsWith("/account")) {
    if (role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
