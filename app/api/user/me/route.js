import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

/* ================= GET CURRENT USER ================= */
export async function GET(req) {
  try {
    await connectDB()

    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not logged in" },
        { status: 401 }
      )
    }

    let decoded

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    }

    /* ================= FETCH USER FROM DB ================= */
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("warehouse", "name code")

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    /* ================= STATUS CHECK ================= */
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Account inactive" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouse: user.warehouse || null,
      },
    })

  } catch (error) {
    console.error("USER ME ERROR:", error)

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
