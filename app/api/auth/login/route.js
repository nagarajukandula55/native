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

    /* ================= VALIDATION ================= */
    if (!email || !password) {
      return Response.json(
        { success: false, msg: "Email and password are required" },
        { status: 400 }
      );
    }

    /* ================= ADMIN LOGIN ================= */
    const admin = await Admin.findOne({ email });

    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return Response.json(
          { success: false, msg: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          id: admin._id,
          role: "admin",
          email: admin.email, // ✅ added
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return Response.json({
        success: true,
        role: "admin",
        token,
      });
    }

    /* ================= STORE LOGIN ================= */
    const store = await Store.findOne({ email });

    if (store) {
      const isMatch = await bcrypt.compare(password, store.password);

      if (!isMatch) {
        return Response.json(
          { success: false, msg: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          id: store._id,
          role: "store",
          email: store.email, // ✅ added
          warehouseId: store.warehouseId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return Response.json({
        success: true,
        role: "store",
        token,
      });
    }

    /* ================= USER LOGIN ================= */
    const user = await User.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return Response.json(
          { success: false, msg: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: "user",
          email: user.email, // ✅ VERY IMPORTANT FIX
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return Response.json({
        success: true,
        role: "user",
        token,
      });
    }

    /* ================= USER NOT FOUND ================= */
    return Response.json(
      { success: false, msg: "User not found" },
      { status: 404 }
    );

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return Response.json(
      { success: false, msg: "Server error" },
      { status: 500 }
    );
  }
}
