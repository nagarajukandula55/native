import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // ✅ Public routes
  const publicRoutes = ["/login", "/", "/products", "/blog", "/track"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ If no token → go login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ DO NOT VERIFY HERE (IMPORTANT)
  return NextResponse.next();
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
