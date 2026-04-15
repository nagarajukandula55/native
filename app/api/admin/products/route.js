import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;

    /* 🔴 NO TOKEN */
    if (!token) {
      return NextResponse.json(
        { success: false, products: [], message: "No token" },
        { status: 401 }
      );
    }

    /* 🔴 VERIFY TOKEN SAFELY */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, products: [], message: "Invalid token" },
        { status: 401 }
      );
    }

    /* 🔴 ROLE CHECK */
    if (!["admin", "super_admin", "vendor"].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, products: [], message: "Forbidden" },
        { status: 403 }
      );
    }

    /* ✅ SUCCESS RESPONSE */
    return NextResponse.json({
      success: true,
      products: [], // replace with DB later
    });

  } catch (err) {
    console.error("PRODUCT API ERROR:", err);

    return NextResponse.json(
      { success: false, products: [], message: "Server error" },
      { status: 500 }
    );
  }
}
