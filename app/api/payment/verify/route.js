import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

/* ================= CORE PAID HANDLER ================= */
async function handleOrderPaid(order, paymentData = {}) {
  let changed = false;

  /* ================= PAYMENT UPDATE ================= */
  order.payment = {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature,
    paidAt: new Date(),
  };

  /* ================= RECEIPT (IDEMPOTENT SAFE) ================= */
  if (!order.receipt?.receiptNumber) {
    const { generateReceiptNumber } = await import("@/lib/receipt");

    order.receipt = {
      receiptNumber: await generateReceiptNumber(),
      generatedAt: new Date(),
      paymentMode: "RAZORPAY",
      paymentReference: paymentData.razorpay_payment_id || "MANUAL",
      amountPaid: order.amount,
    };

    changed = true;
  }

  /* ================= INVOICE (IDEMPOTENT SAFE) ================= */
  if (!order.invoice?.invoiceNumber) {
    const { generateInvoiceNumber } = await import("@/lib/invoiceNumber");
    const { generateInvoiceHTML } = await import("@/lib/invoice");

    order.invoice = {
      invoiceNumber: await generateInvoiceNumber(order.createdAt),
      generatedAt: new Date(),
    };

    order.invoiceHTML = generateInvoiceHTML(order.toObject());

    changed = true;
  }

  return changed;
}

/* ================= PAYMENT VERIFY ROUTE ================= */
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

    /* ================= IDEMPOTENCY LOCK ================= */
    if (order.status === "PAID" && order.receipt?.receiptNumber) {
      return NextResponse.json({
        success: true,
        message: "Already processed",
        orderId,
        receipt: order.receipt,
      });
    }

    /* ================= ORDER MISMATCH CHECK ================= */
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

    /* ================= STEP 2: PROCESS RECEIPT + INVOICE ================= */
    await handleOrderPaid(order, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      mode: "RAZORPAY",
    });

    /* ================= STEP 3: SAVE FINAL STATE ================= */
    await order.save();

    /* ================= STEP 4: ASYNC NOTIFICATIONS (NON-BLOCKING) ================= */
    setImmediate(async () => {
      try {
        // 🔥 FUTURE READY HOOKS
        // await sendWhatsAppReceipt(order);
        // await sendPaymentReceiptEmail(order);
      } catch (err) {
        console.error("Notification error:", err);
      }
    });

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
