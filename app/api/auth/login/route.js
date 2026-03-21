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
      return Response.json({ success: false, msg: "All fields are required" }, { status: 400 });
    }

    /* ================= ADMIN ================= */
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return Response.json({ success: false, msg: "Invalid credentials" }, { status: 401 });
      }

      const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return Response.json({ success: true, role: "admin", token });
    }

    /* ================= STORE ================= */
    const store = await Store.findOne({ email });
    if (store) {
      const isMatch = await bcrypt.compare(password, store.password);
      if (!isMatch) {
        return Response.json({ success: false, msg: "Invalid credentials" }, { status: 401 });
      }

      const token = jwt.sign(
        {
          id: store._id,
          role: "store",
          warehouseId: store.warehouseId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return Response.json({ success: true, role: "store", token });
    }

    /* ================= USER ================= */
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return Response.json({ success: false, msg: "Invalid credentials" }, { status: 401 });
      }

      const token = jwt.sign(
        { id: user._id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return Response.json({ success: true, role: "user", token });
    }

    return Response.json({ success: false, msg: "User not found" }, { status: 404 });

  } catch (err) {
    console.error(err);
    return Response.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
