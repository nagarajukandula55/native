import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email & Password required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* ===== PASSWORD CHECK ===== */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* ===== JWT ===== */
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });

    /* ===== COOKIE (FINAL FIX) ===== */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,      // ⚠️ keep false in local
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
