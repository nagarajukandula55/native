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
      return new Response(JSON.stringify({ success: false, msg: "All fields required" }), { status: 400 });
    }

    /* ================= ADMIN ================= */
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 });

      const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return new Response(JSON.stringify({ success: true, role: "admin", token }), { status: 200 });
    }

    /* ================= STORE ================= */
    const store = await Store.findOne({ email });
    if (store) {
      const isMatch = await bcrypt.compare(password, store.password);
      if (!isMatch) return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 });

      const token = jwt.sign({ id: store._id, role: "store", warehouseId: store.warehouseId }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return new Response(JSON.stringify({ success: true, role: "store", token }), { status: 200 });
    }

    /* ================= USER ================= */
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 });

      const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return new Response(JSON.stringify({ success: true, role: "user", token }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: false, msg: "User not found" }), { status: 404 });

  } catch (err) {
    console.error("Login API error:", err);
    return new Response(JSON.stringify({ success: false, msg: "Server error" }), { status: 500 });
  }
}
