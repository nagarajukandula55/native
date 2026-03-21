import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ success: false, msg: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return Response.json({ success: false, msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
    });

    return Response.json({ success: true, msg: "Account created" });

  } catch (err) {
    console.log(err);
    return Response.json({ success: false, msg: "Server error" });
  }
}
