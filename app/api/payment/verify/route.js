import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateReceiptNumber } from "@/lib/receipt";

/* ================= PAYMENT VERIFY ================= */
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

    /* ================= SIGNATURE VERIFY ================= */
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

    /* ================= IDEMPOTENCY (IMPORTANT) ================= */
    if (order.status === "PAID" && order.receipt?.receiptNumber) {
      return NextResponse.json({
        success: true,
        message: "Already processed",
        orderId,
        receipt: order.receipt,
      });
    }

    /* ================= PAYMENT MISMATCH CHECK ================= */
    if (
      order.payment?.razorpay_order_id &&
      order.payment.razorpay_order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        { success: false, message: "Order mismatch" },
        { status: 400 }
      );
    }

    /* ================= STEP 1: MARK PAID ================= */
    order.status = "PAID";

    order.payment = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paidAt: new Date(),
    };

    /* ================= STEP 2: GENERATE RECEIPT (ATOMIC SAFE) ================= */
    if (!order.receipt?.receiptNumber) {
      const receiptNumber = await generateReceiptNumber();

      order.receipt = {
        receiptNumber,
        generatedAt: new Date(),
        paymentMode: "RAZORPAY",
        paymentReference: razorpay_payment_id,
        amountPaid: order.amount,
      };
    }

    /* ================= STEP 3: GENERATE INVOICE ================= */
    const { generateInvoiceHTML } = await import("@/lib/invoice");

    order.invoiceHTML = generateInvoiceHTML(order.toObject());

    /* ================= STEP 4: SAVE ================= */
    await order.save();

    /* ================= STEP 5: OPTIONAL EMAIL ================= */
    try {
      // await sendPaymentReceiptEmail(order);
    } catch (err) {
      console.error("Email error:", err);
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      orderId,
      receipt: order.receipt,
    });

  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
