import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ success: false, msg: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();

    // 👉 For now just return link (later we send email)
    return Response.json({
      success: true,
      resetLink: `http://localhost:3000/reset-password?token=${token}`,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ success: false, msg: "Server error" });
  }
}
