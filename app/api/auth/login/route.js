import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/* 🔥 MOCK USER (replace with DB later) */
const USERS = [
  {
    email: "an@shopnative.in",
    password: "123456",
    name: "AN",
    role: "super_admin",
  },
  {
    email: "admin@shopnative.in",
    password: "123456",
    name: "Admin",
    role: "admin",
  },
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    /* ===== VALIDATION ===== */
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email & Password required" },
        { status: 400 }
      );
    }

    /* ===== USER CHECK ===== */
    const user = USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ===== CREATE TOKEN ===== */
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ===== RESPONSE ===== */
    const response = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    /* 🔥🔥🔥 CRITICAL FIX: SET COOKIE PROPERLY 🔥🔥🔥 */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ important for Vercel
      sameSite: "lax",
      path: "/", // ✅ VERY IMPORTANT
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
