import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await db();

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Return current payment status
    return NextResponse.json({
      success: true,
      paymentStatus: order.paymentStatus || "Pending",
    });
  } catch (err) {
    console.error("UPI STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
