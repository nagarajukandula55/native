import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Get email and password from request
    const { email, password } = await req.json();

    // 3️⃣ Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, msg: "Email and password are required" },
        { status: 400 }
      );
    }

    // 4️⃣ Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, msg: "User not found" },
        { status: 404 }
      );
    }

    // 5️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, msg: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 6️⃣ Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,  // can be admin/store/user/branding
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7️⃣ Send JSON response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // 8️⃣ Set cookie with token
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
