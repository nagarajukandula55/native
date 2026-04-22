import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = [
    "/admin",
    "/vendor",
    "/finance",
    "/support",
    "/branding",
    "/analytics",
    "/super-admin",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/finance/:path*",
    "/support/:path*",
    "/branding/:path*",
    "/analytics/:path*",
    "/super-admin/:path*",
  ],
};
