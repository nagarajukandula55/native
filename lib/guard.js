import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function requirePermission(req, permission, handler) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user.permissions?.includes(permission)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(user);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
