// app/api/auth/login/route.js
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Store from "@/models/Store";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, msg: "All fields are required" }), { status: 400 });
    }

    // ======== HELPER FUNCTION TO SET COOKIES ========
    const setCookies = (res, token, role) => {
      const tokenCookie = serialize("token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      const roleCookie = serialize("role", role, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return new Response(JSON.stringify({ success: true, role }), {
        status: 200,
        headers: { "Set-Cookie": [tokenCookie, roleCookie], "Content-Type": "application/json" },
      });
    };

    // ======== CHECK ADMIN ========
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 });

      const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return setCookies(null, token, "admin");
    }

    // ======== CHECK STORE ========
    const store = await Store.findOne({ email });
    if (store) {
      const isMatch = await bcrypt.compare(password, store.password);
      if (!isMatch) return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 });

      const token = jwt.sign({ id: store._id, role: "store", warehouseId: store.warehouseId }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return setCookies(null, token, "store");
    }

    // ======== CHECK USER ========
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 });

      const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return setCookies(null, token, "user");
    }

    return new Response(JSON.stringify({ success: false, msg: "User not found" }), { status: 404 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, msg: "Server error" }), { status: 500 });
  }
}
