import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic"; // 🔥 IMPORTANT FIX

export async function GET(req) {
  try {
    // ✅ Correct way to read cookies in App Router
    const token = req.cookies.get("token")?.value;

    // ❌ No token = not logged in
    if (!token) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    // 🔐 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    // ✅ Return safe user object
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      },
    });

  } catch (err) {
    console.error("❌ /api/auth/me ERROR:", err);

    return NextResponse.json({
      success: false,
      user: null,
    });
  }
}
