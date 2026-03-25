import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    const user = await User.findById(decoded.id).select("-password");

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
