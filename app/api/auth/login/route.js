import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    /* ================= VALIDATION ================= */
    if (!email || !password) {
      return NextResponse.json(
        { success: false, msg: "Email and password are required" },
        { status: 400 }
      );
    }

    /* ================= FIND USER ================= */
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, msg: "User not found" },
        { status: 404 }
      );
    }

    /* ================= CHECK PASSWORD ================= */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, msg: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ================= CREATE TOKEN ================= */
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role, // 🔥 important
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ================= RESPONSE ================= */
    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    /* ================= SET COOKIE ================= */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { success: false, msg: error.message || "Server error" },
      { status: 500 }
    );
  }
}
