import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { success: false, msg: "All fields required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return Response.json(
        { success: false, msg: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // ✅ CREATE USER WITH ROLE
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
    });

    return Response.json({
      success: true,
      msg: "Account created successfully",
      userId: user._id,
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, msg: "Server error" },
      { status: 500 }
    );
  }
}
