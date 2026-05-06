import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import crypto from "crypto";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    /* ================= VERIFY SIGNATURE ================= */
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    /* ================= PAYMENT SUCCESS ================= */
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const order = await Order.findOne({
        "payment.razorpay_order_id": payment.order_id,
      });

      if (!order) {
        return NextResponse.json({ success: true });
      }

      if (order.payment?.status === "SUCCESS") {
        return NextResponse.json({ success: true });
      }

      const prevStatus = order.status;

      order.payment.status = "SUCCESS";
      order.payment.razorpay_payment_id = payment.id;
      order.payment.razorpay_signature = signature;
      order.payment.paidAt = new Date();

      order.status = "PAID";

      /* ================= AUDIT ================= */
      order.auditLogs.push({
        action: "PAYMENT_CAPTURED",
        from: prevStatus,
        to: "PAID",
        by: "RAZORPAY_WEBHOOK",
      });

      await order.save();
    }

    /* ================= RETURN ================= */
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("RAZORPAY WEBHOOK ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
