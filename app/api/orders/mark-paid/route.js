import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const { orderId, utr } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID required" },
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

    if (order.payment?.status === "SUCCESS") {
      return NextResponse.json(
        { success: false, message: "Already paid" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ================= */
    order.payment.status = "SUCCESS";
    order.payment.method = order.payment.method || "UPI";
    order.payment.utr = utr || null;
    order.payment.paidAt = new Date();

    const prevStatus = order.status;

    order.status = "PAID";

    /* ================= AUDIT ================= */
    order.auditLogs.push({
      action: "MANUAL_PAYMENT",
      from: prevStatus,
      to: "PAID",
      by: "ADMIN",
    });

    await order.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("MARK PAID ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
