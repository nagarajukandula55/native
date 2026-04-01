import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/* ================= LOGIN ================= */
export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email and password required",
      });
    }

    /* ================= FIND USER ================= */
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ================= CHECK PASSWORD ================= */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ================= CREATE TOKEN ================= */
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,     // 🔥 IMPORTANT
        email: user.email,
        role: user.role,     // 🔥 IMPORTANT (admin/store/user/branding)
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ================= SET COOKIE ================= */
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // 🔥 keep false for localhost (true in production)
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
