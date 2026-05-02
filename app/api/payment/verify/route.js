import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

/* ================= BILLING CALCULATION ================= */
function calculateBilling(order) {
  const subtotal =
    order.items?.reduce((sum, item) => {
      return sum + item.price * item.qty;
    }, 0) || 0;

  const discount = order.discount || 0;

  const taxableAmount = Math.max(subtotal - discount, 0);

  const taxRate = 18;

  const companyState = "KA"; // 🔒 SET YOUR STATE CODE HERE
  const customerState = order.address?.state || "";

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (customerState && customerState === companyState) {
    cgst = +(taxableAmount * (taxRate / 2) / 100).toFixed(2);
    sgst = +(taxableAmount * (taxRate / 2) / 100).toFixed(2);
  } else {
    igst = +(taxableAmount * taxRate / 100).toFixed(2);
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
async function handleOrderPaid(order, paymentData) {
  let updated = false;

  /* ================= PAYMENT ================= */
  order.payment = {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature,
    method: paymentData.mode || "ONLINE",
    paidAt: new Date(),
  };

  /* ================= BILLING ================= */
  if (!order.billing) {
    order.billing = calculateBilling(order);
    updated = true;
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

    updated = true;
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
      billing: order.billing,
    });

    updated = true;
  }

  return updated;
}

/* ================= API ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    /* ================= VALIDATION ================= */
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
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

    /* ================= ORDER VALIDATION ================= */
    if (
      order.payment?.razorpay_order_id &&
      order.payment.razorpay_order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        { success: false, message: "Order mismatch" },
        { status: 400 }
      );
    }

    /* ================= UPDATE STATUS ================= */
    order.status = "PAID";

    /* ================= PROCESS ================= */
    await handleOrderPaid(order, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      mode: "RAZORPAY",
    });

    /* ================= SAVE ================= */
    await order.save();

    /* ================= ASYNC NOTIFICATIONS ================= */
    setImmediate(async () => {
      try {
        // integrate when ready
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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
