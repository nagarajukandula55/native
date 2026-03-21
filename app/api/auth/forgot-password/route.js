import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return Response.json({ success: false, msg: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  return Response.json({
    success: true,
    msg: "Use this token to reset password",
    token, // TEMP: show token (later send email)
  });
}
