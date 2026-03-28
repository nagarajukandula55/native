import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = params;
    const { name, email, role, warehouseId, warehouseName, warehouseCode, isActive } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role, warehouseId, warehouseName, warehouseCode, isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
