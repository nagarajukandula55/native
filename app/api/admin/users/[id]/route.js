import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { role } = await req.json();

    if (!["user", "store", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      { role },
      { new: true }
    ).select("-password");

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
