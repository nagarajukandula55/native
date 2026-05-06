import { NextResponse } from "next/server";
import crypto from "crypto";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import WebhookLog from "@/models/WebhookLog";
import NotificationQueue from "@/models/NotificationQueue";

/* ================= WEBHOOK ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const rawBody = await req.text();
    let event;

    try {
      event = JSON.parse(rawBody);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    /* ================= VERIFY SIGNATURE ================= */
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const isValidSignature = expectedSignature === signature;

    /* ================= LOG WEBHOOK ================= */
    const log = await WebhookLog.create({
      provider: "razorpay",
      event: event?.event || "unknown",
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

    /* ================= ONLY PAYMENT SUCCESS ================= */
    if (event.event !== "payment.captured") {
      log.status = "PROCESSED";
      await log.save();

      return NextResponse.json({ success: true });
    }

    const payment = event?.payload?.payment?.entity;

    if (!payment?.order_id) {
      log.status = "FAILED";
      log.error = "Missing order_id in payment payload";
      await log.save();

      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

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

    /* ================= IDENTITY CHECK (HARD STOP DUPLICATES) ================= */
    if (order.status === "PAID") {
      log.status = "PROCESSED";
      log.error = "Duplicate webhook ignored (order already PAID)";
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

    /* ================= UPDATE LOG ================= */
    log.status = "PROCESSED";
    log.orderId = order.orderId;
    await log.save();

      /* ================= FALLBACK QUEUE ================= */
      await NotificationQueue.create({
        type: "EMAIL",
        orderId: order.orderId,
        payload: {
          orderId: order.orderId,
          email: order.address?.email,
          amount: order.amount,
        },
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
