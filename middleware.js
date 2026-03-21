import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const { pathname } = req.nextUrl;

  /* ================= PUBLIC ROUTES ================= */
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return NextResponse.next();
  }

  /* ================= NO TOKEN ================= */
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ================= VERIFY TOKEN ================= */
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ================= ROLE FIX (IMPORTANT) ================= */

  // ADMIN
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // STORE
  if (pathname.startsWith("/admin/store")) {
    if (role !== "store") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // USER
  if (pathname.startsWith("/account")) {
    if (role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

/* ================= MATCHER ================= */
export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
