import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

/* ================= BILLING CALCULATOR ================= */
function calculateBilling(order) {
  const subtotal =
    order.items?.reduce((sum, item) => {
      return sum + item.price * item.qty;
    }, 0) || 0;

  const discount = order.discount || 0;

  const taxableAmount = subtotal - discount;

  const taxRate = 18; // 🔥 keep simple for now

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  // 🔥 Basic GST logic (same state → CGST+SGST)
  const isSameState = true; // you can enhance later

  if (isSameState) {
    cgst = (taxableAmount * taxRate) / 200;
    sgst = (taxableAmount * taxRate) / 200;
  } else {
    igst = (taxableAmount * taxRate) / 100;
  }

  return {
    subtotal,
    discount,
    taxableAmount,
    taxRate,
    cgst,
    sgst,
    igst,
    total: order.amount,
  };
}

/* ================= CORE PAID HANDLER ================= */
async function handleOrderPaid(order, paymentData = {}) {
  let changed = false;

  /* ================= PAYMENT ================= */
  order.payment = {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature,
    method: paymentData.mode || "ONLINE",
    paidAt: new Date(),
  };

  /* ================= BILLING (🔥 CRITICAL ADDITION) ================= */
  if (!order.billing) {
    order.billing = calculateBilling(order);
    changed = true;
  }

  /* ================= RECEIPT ================= */
  if (!order.receipt?.receiptNumber) {
    const { generateReceiptNumber } = await import("@/lib/receipt");

    order.receipt = {
      receiptNumber: await generateReceiptNumber(),
      generatedAt: new Date(),
      paymentMode: paymentData.mode || "RAZORPAY",
      paymentReference:
        paymentData.razorpay_payment_id || "MANUAL",
      amountPaid: order.amount,
    };

    changed = true;
  }

  /* ================= INVOICE ================= */
  if (!order.invoice?.invoiceNumber) {
    const { generateInvoiceNumber } = await import("@/lib/invoiceNumber");
    const { generateInvoiceHTML } = await import("@/lib/invoice");

    order.invoice = {
      invoiceNumber: await generateInvoiceNumber(order.createdAt),
      generatedAt: new Date(),
    };

    order.invoiceHTML = generateInvoiceHTML({
      ...order.toObject(),
      billing: order.billing, // 🔥 ensure billing is used
    });

    changed = true;
  }

  return changed;
}

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

    /* ================= IDEMPOTENCY ================= */
    if (order.status === "PAID" && order.receipt?.receiptNumber) {
      return NextResponse.json({
        success: true,
        message: "Already processed",
        orderId,
        receipt: order.receipt,
      });
    }

    /* ================= ORDER MISMATCH ================= */
    if (
      order.payment?.razorpay_order_id &&
      order.payment.razorpay_order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        { success: false, message: "Order mismatch" },
        { status: 400 }
      );
    }

    /* ================= STEP 1 ================= */
    order.status = "PAID";

    /* ================= STEP 2 ================= */
    await handleOrderPaid(order, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      mode: "RAZORPAY",
    });

    /* ================= STEP 3 ================= */
    await order.save();

    /* ================= STEP 4 (ASYNC NOTIFICATIONS) ================= */
    setImmediate(async () => {
      try {
        // future hooks
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
