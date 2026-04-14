import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: "All fields required",
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
