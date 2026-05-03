import { NextResponse } from "next/server";
import crypto from "crypto";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import WebhookLog from "@/models/WebhookLog";
import NotificationQueue from "@/models/NotificationQueue";

import { notifyOrderEvent } from "@/lib/notifications/notifyOrderEvent";

/* ================= WEBHOOK ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    /* ================= VERIFY SIGNATURE ================= */
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const isValidSignature = expectedSignature === signature;

    const event = JSON.parse(rawBody);

    /* ================= SAVE WEBHOOK LOG (ALWAYS FIRST) ================= */
    const log = await WebhookLog.create({
      provider: "razorpay",
      event: event.event,
      payload: event,
      signatureValid: isValidSignature,
      status: "RECEIVED",
    });

    if (!isValidSignature) {
      log.status = "FAILED";
      log.error = "Invalid signature";
      await log.save();

      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    /* ================= ONLY HANDLE PAYMENT SUCCESS ================= */
    if (event.event !== "payment.captured") {
      log.status = "PROCESSED";
      await log.save();

      return NextResponse.json({ success: true });
    }

    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    /* ================= FIND ORDER ================= */
    const order = await Order.findOne({
      "payment.razorpay_order_id": razorpayOrderId,
    });

    if (!order) {
      log.status = "FAILED";
      log.error = "Order not found";
      await log.save();

      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ================= DUPLICATE PROTECTION ================= */
    if (order.status === "PAID") {
      log.status = "PROCESSED";
      log.error = "Duplicate webhook ignored (already PAID)";
      await log.save();

      return NextResponse.json({
        success: true,
        message: "Already processed",
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

    log.status = "PROCESSED";
    log.orderId = order.orderId;
    await log.save();

    /* ================= NOTIFICATIONS ================= */
    try {
      await notifyOrderEvent(order, prevStatus);
    } catch (notifyErr) {
      console.error("NOTIFY ERROR:", notifyErr);

      // fallback queue (retry system)
      await NotificationQueue.create({
        type: "EMAIL",
        orderId: order.orderId,
        payload: order,
        attempts: 0,
        status: "PENDING",
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("WEBHOOK ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Webhook failed",
      },
      { status: 500 }
    );
  }
}
