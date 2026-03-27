import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ success: false, msg: "Email and password are required" }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ success: false, msg: "User not found" }, { status: 404 });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Response with cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ success: false, msg: error.message || "Server error" }, { status: 500 });
  }
}
