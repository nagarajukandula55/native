import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  console.log("PATH:", pathname);
  console.log("TOKEN:", token ? "EXISTS" : "MISSING");

  // ✅ Always allow these
  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/products")
  ) {
    return NextResponse.next();
  }

  // ❌ No token → login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    console.log("USER ROLE:", user.role);

    // ✅ Role protection
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
