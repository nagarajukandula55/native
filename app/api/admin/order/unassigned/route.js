import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const orders = await Order.find({ assignedTo: null }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET UNASSIGNED ORDERS ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
