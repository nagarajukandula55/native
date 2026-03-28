import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Dynamic role list
    const roles = ["user", "store", "admin", "branding"]; // you can extend in future
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
