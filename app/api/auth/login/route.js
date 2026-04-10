import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email & password required" });
    }

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" });
    }

    // 🔥 FIXED PASSWORD HANDLING
    const hashedPassword = user.password || user.passwordHash;

    if (!hashedPassword) {
      return NextResponse.json({
        success: false,
        message: "User not configured properly",
      });
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
