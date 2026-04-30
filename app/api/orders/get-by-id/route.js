import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    // ✅ PROPER WAY IN APP ROUTER
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID missing",
      });
    }

    const order = await Order.findOne({
      orderId: orderId.trim(),
    }).lean();

    if (!order) {
      return NextResponse.json({
        success: false,
        message: "Order not found",
      });
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("TRACK ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}
