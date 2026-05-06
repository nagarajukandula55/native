import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const { orderId, utr } = body;

    console.log("🟡 MARK PAID HIT:", body);

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "OrderId required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ================= ALREADY PAID ================= */
    if (order.payment?.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Already marked as paid",
      });
    }

    const prevStatus = order.status;

    /* ================= UPDATE PAYMENT ================= */
    order.payment = {
      ...order.payment,
      status: "SUCCESS",
      method: order.payment?.method || "MANUAL",
      utr: utr || null,
      paidAt: new Date(),
    };

    /* ================= UPDATE ORDER ================= */
    order.status = "PAID";

    /* ================= AUDIT ================= */
    order.auditLogs.push({
      action: "MANUAL_PAYMENT_MARKED",
      from: prevStatus,
      to: "PAID",
      by: "ADMIN",
      at: new Date(),
    });

    /* ================= SAVE ================= */
    await order.save();

    console.log("🟢 ORDER MARKED PAID:", order.orderId);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
    });

  } catch (err) {
    console.error("🔴 MARK PAID ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to mark paid",
      },
      { status: 500 }
    );
  }
}
