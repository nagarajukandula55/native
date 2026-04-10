import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await connectDB();

    /* ================= BODY ================= */
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: "Invalid request",
      });
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email and password required",
      });
    }

    /* ================= USER ================= */
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ================= PASSWORD CHECK (FINAL) ================= */
    if (!user.password || typeof user.password !== "string") {
      return NextResponse.json({
        success: false,
        message: "Invalid user configuration",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ================= JWT ================= */
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ================= RESPONSE ================= */
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });

    /* ================= COOKIE ================= */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ important
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
