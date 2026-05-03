import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { notifyOrderEvent } from "@/lib/notifications/notifyOrderEvent";

/* ================= RAZORPAY WEBHOOK ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.text(); // RAW body required
    const signature = req.headers.get("x-razorpay-signature");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    /* ================= VERIFY SIGNATURE ================= */
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    /* ================= PAYMENT SUCCESS EVENT ================= */
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const razorpayOrderId = payment.order_id;

      const order = await Order.findOne({
        "payment.razorpay_order_id": razorpayOrderId,
      });

      if (!order) {
        return NextResponse.json({
          success: false,
          message: "Order not found",
        });
      }

      const prevStatus = order.status;

      /* ================= UPDATE ORDER ================= */
      order.status = "PAID";

      order.payment = {
        ...order.payment,
        razorpay_payment_id: payment.id,
        method: payment.method,
        paidAt: new Date(),
      };

      await order.save();

      /* ================= NOTIFICATIONS ================= */
      await notifyOrderEvent(order, prevStatus);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("RAZORPAY WEBHOOK ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Webhook error",
      },
      { status: 500 }
    );
  }
}
