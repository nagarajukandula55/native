import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ success: false, msg: "All fields required" }, { status: 400 });

    // Check Admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (!match) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

      const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });

      const res = NextResponse.json({ success: true, role: "admin" });
      res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60 });
      res.cookies.set("role", "admin", { path: "/", maxAge: 7 * 24 * 60 * 60 });
      return res;
    }

    // Check Store
    const store = await Store.findOne({ email });
    if (store) {
      const match = await bcrypt.compare(password, store.password);
      if (!match) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

      const token = jwt.sign({ id: store._id, role: "store", warehouseId: store.warehouseId }, process.env.JWT_SECRET, { expiresIn: "7d" });

      const res = NextResponse.json({ success: true, role: "store" });
      res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60 });
      res.cookies.set("role", "store", { path: "/", maxAge: 7 * 24 * 60 * 60 });
      return res;
    }

    // Check User
    const user = await User.findOne({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return NextResponse.json({ success: false, msg: "Invalid credentials" }, { status: 401 });

      const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });

      const res = NextResponse.json({ success: true, role: "user" });
      res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60 });
      res.cookies.set("role", "user", { path: "/", maxAge: 7 * 24 * 60 * 60 });
      return res;
    }

    return NextResponse.json({ success: false, msg: "User not found" }, { status: 404 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
