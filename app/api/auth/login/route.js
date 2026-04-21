import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 🔥 TEMP USER (replace with DB later)
    if (email !== "admin@shopnative.in" || password !== "123456") {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = {
      name: "Admin",
      email,
      role: "admin",
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({
      success: true,
      user,
    });

    /* 🔥 CRITICAL COOKIE FIX */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,          // 🔥 REQUIRED for Vercel HTTPS
      sameSite: "lax",      // 🔥 REQUIRED for browser cookies
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
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
