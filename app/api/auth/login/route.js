import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
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

    response.cookies.set("token", token, {
    httpOnly: true,
    secure: false,       // ✅ IMPORTANT (keep false in local)
    sameSite: "lax",     // ✅ IMPORTANT
    path: "/",           // ✅ IMPORTANT
    maxAge: 60 * 60 * 24 * 7,
  });

    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
