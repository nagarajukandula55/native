import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateInvoiceHTML } from "@/lib/invoice";

export async function POST(req) {
  try {
    await dbConnect();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await req.json();

    /* ================= VALIDATION ================= */
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        { success: false, message: "Missing payment data" },
        { status: 400 }
      );
    }

    /* ================= VERIFY SIGNATURE ================= */
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    /* ================= FETCH ORDER ================= */
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ================= IDENTITY LOCK (VERY IMPORTANT) ================= */
    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Already processed",
        orderId,
      });
    }

    /* ================= ORDER MISMATCH CHECK ================= */
    if (
      order.payment?.razorpay_order_id &&
      order.payment.razorpay_order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        { success: false, message: "Order ID mismatch" },
        { status: 400 }
      );
    }

    /* ================= MARK AS PAID ================= */
    order.status = "PAID";

    order.payment = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paidAt: new Date(),
    };

    /* ================= GENERATE INVOICE HTML ================= */
    const invoiceHTML = generateInvoiceHTML(order.toObject());

    order.invoiceHTML = invoiceHTML;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      orderId,
    });

  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
