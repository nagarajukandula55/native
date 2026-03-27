import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, msg: "Not authenticated" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return NextResponse.json({ success: false, msg: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    return NextResponse.json({ success: false, msg: "Invalid token" }, { status: 401 });
  }
}
