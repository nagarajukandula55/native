import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

/* ================= LOGIN ================= */
export async function POST(req) {
  try {
    await connectDB()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      )
    }

    /* ================= FIND USER ================= */
    const user = await User.findOne({ email }).populate("warehouse")

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    /* ================= STATUS CHECK ================= */
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Account inactive" },
        { status: 403 }
      )
    }

    /* ================= PASSWORD CHECK ================= */
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    /* ================= CREATE TOKEN ================= */
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouse: user.warehouse?._id || null, // 🔥 IMPORTANT
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    /* ================= RESPONSE ================= */
    const response = NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouse: user.warehouse || null,
      },
    })

    /* ================= COOKIE ================= */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ FIXED
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response

  } catch (error) {
    console.error("LOGIN ERROR:", error)

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
