import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (email !== "admin@shopnative.in" || password !== "123456") {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = {
      id: 1,
      name: "Admin",
      email,
      permissions: [
        "orders.view",
        "orders.process",
        "products.view",
        "warehouse.view"
      ]
    };
    
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const res = NextResponse.json({
      success: true,
      user,
    });

    // ✅ FIXED COOKIE (THIS IS THE KEY)
    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // 🔥 IMPORTANT FIX (NOT none)
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
