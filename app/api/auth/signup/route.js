import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    /* ================= VALIDATION ================= */
    if (!name || !email || !password) {
      return Response.json(
        { success: false, msg: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, msg: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    /* ================= CHECK EXISTING ================= */
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        { success: false, msg: "User already exists" },
        { status: 400 }
      );
    }

    /* ================= CREATE USER ================= */
    await User.create({
      name,
      email,
      password, // 🔥 DO NOT HASH HERE (model will hash)
      role: "user", // 🔥 IMPORTANT
    });

    return Response.json({
      success: true,
      msg: "Account created successfully",
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    return Response.json(
      { success: false, msg: "Server error" },
      { status: 500 }
    );
  }
}
