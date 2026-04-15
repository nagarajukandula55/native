import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/", "/products", "/blog", "/track"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // No token → force login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // role-based protection
    if (pathname.startsWith("/admin") && decoded.role !== "admin" && decoded.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/vendor") && decoded.role !== "vendor") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/finance/:path*",
    "/branding/:path*",
    "/analytics/:path*",
    "/super-admin/:path*",
  ],
};
