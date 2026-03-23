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
      return NextResponse.json({ success: false, msg: "All fields required" }, { status: 400 });
    }

    let account = null;
    let role = null;

    // ADMIN
    const admin = await Admin.findOne({ email });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (!match) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

      account = admin;
      role = "admin";
    }

    // STORE
    if (!account) {
      const store = await Store.findOne({ email });
      if (store) {
        const match = await bcrypt.compare(password, store.password);
        if (!match) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

        account = store;
        role = "store";
      }
    }

    // USER
    if (!account) {
      const user = await User.findOne({ email });
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (!match) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

        account = user;
        role = "user";
      }
    }

    if (!account) {
      return NextResponse.json({ success: false, msg: "User not found" }, { status: 404 });
    }

    const token = jwt.sign(
      { id: account._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 SET COOKIE FROM SERVER (FIX)
    const response = NextResponse.json({
      success: true,
      role,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
