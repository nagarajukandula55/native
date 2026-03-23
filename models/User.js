import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const url = req.nextUrl.pathname;

  console.log("MIDDLEWARE:", { url, role, hasToken: !!token });

  /* ================= PUBLIC ROUTES ================= */
  if (
    url.startsWith("/login") ||
    url.startsWith("/signup") ||
    url.startsWith("/forgot-password") ||
    url.startsWith("/reset-password")
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

  /* ================= ROLE CHECK ================= */

  // 🔥 FIX: STORE FIRST
  if (url.startsWith("/admin/store")) {
    if (role !== "store") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next(); // ✅ STOP HERE
  }

  // 🔥 FIX: ADMIN
  if (url.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next(); // ✅ STOP HERE
  }

  // 🔥 USER
  if (url.startsWith("/account")) {
    if (role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
