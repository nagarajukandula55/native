import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import Order from "@/models/Order";

export async function PUT(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("Forbidden");

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "Order ID & status required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    // ✅ Update payment
    order.paymentStatus = status;
    order.paymentVerifiedBy = decoded.id;
    order.paymentVerifiedAt = new Date();

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully",
    });

  } catch (err) {
    console.error("PAYMENT UPDATE ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
