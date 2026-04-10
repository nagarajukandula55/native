import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.pathname;

  if (url.startsWith("/admin") || url.startsWith("/store")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (url.startsWith("/admin") && decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (url.startsWith("/store") && decoded.role !== "store") {
        return NextResponse.redirect(new URL("/", req.url));
      }

    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
