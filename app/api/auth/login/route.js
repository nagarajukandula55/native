import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 🔥 TEMP USER (replace later with DB)
    if (email !== "admin@shopnative.in" || password !== "123456") {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = {
      name: "Admin",
      email,
      role: "admin",
    };

    // 🔥 MUST HAVE SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set");
    }

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({
      success: true,
      user,
    });

    // 🔥 FINAL COOKIE CONFIG (THIS FIXES YOUR ISSUE)
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        // ❗ ADD THIS LINE
        domain: ".shopnative.in",
        maxAge: 60 * 60 * 24 * 7,
      });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}
