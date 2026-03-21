import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const url = req.nextUrl.pathname;

  /* ================= PUBLIC ROUTES ================= */
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

  if (publicRoutes.some(route => url.startsWith(route))) {
    
    // 🔥 If already logged in → redirect away from login pages
    if (token && role) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } 
      else if (role === "store") {
        return NextResponse.redirect(new URL("/admin/store/dashboard", req.url));
      } 
      else {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

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

  /* ================= ROLE BASED ACCESS ================= */

  // 🔥 STORE (check FIRST)
  if (url.startsWith("/admin/store")) {
    if (role !== "store") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🔥 ADMIN
  else if (url.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🔥 USER
  else if (url.startsWith("/account")) {
    if (role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

/* ================= ROUTES TO PROTECT ================= */
export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
