import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const url = req.nextUrl.pathname;

  // PUBLIC
  if (
    url.startsWith("/login") ||
    url.startsWith("/signup") ||
    url.startsWith("/forgot-password") ||
    url.startsWith("/reset-password")
  ) {
    return NextResponse.next();
  }

  // NO TOKEN
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // VERIFY
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔥 STORE FIRST
  if (url.startsWith("/admin/store")) {
    if (role !== "store") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ADMIN
  if (url.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // USER
  if (url.startsWith("/account")) {
    if (role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
