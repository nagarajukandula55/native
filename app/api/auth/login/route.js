import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
