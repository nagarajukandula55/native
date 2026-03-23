import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, msg: "All fields are required" },
        { status: 400 }
      );
    }

    let account = null;
    let role = null;

    /* ================= ADMIN ================= */
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, msg: "Invalid credentials" },
          { status: 401 }
        );
      }

      account = admin;
      role = "admin";
    }

    /* ================= STORE ================= */
    if (!account) {
      const store = await Store.findOne({ email });
      if (store) {
        const isMatch = await bcrypt.compare(password, store.password);
        if (!isMatch) {
          return NextResponse.json(
            { success: false, msg: "Invalid credentials" },
            { status: 401 }
          );
        }

        account = store;
        role = "store";
      }
    }

    /* ================= USER ================= */
    if (!account) {
      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json(
            { success: false, msg: "Invalid credentials" },
            { status: 401 }
          );
        }

        account = user;
        role = "user";
      }
    }

    if (!account) {
      return NextResponse.json(
        { success: false, msg: "User not found" },
        { status: 404 }
      );
    }

    /* ================= TOKEN ================= */
    const token = jwt.sign(
      {
        id: account._id,
        role: role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ================= RESPONSE ================= */
    const response = NextResponse.json({
      success: true,
      role,
    });

    /* ================= COOKIE (CRITICAL FIX) ================= */
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,          // required for HTTPS (Vercel)
      sameSite: "none",      // 🔥 FIX FOR YOUR ISSUE
      path: "/",
      // domain: ".shopnative.in", // 👉 uncomment ONLY if still issue
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { success: false, msg: err.message || "Server error" },
      { status: 500 }
    );
  }
}
