import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import Order from "@/models/Order";

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const order = await Order.findById(params.id)
      .populate("assignedStore", "name email")
      .populate("warehouseAssignments.warehouseId", "name code")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("GET ORDER ERROR:", err);

    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}
