import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import Company from "@/models/CompanySettings";

import generateInvoiceNumber from "@/lib/generateInvoiceNumber";
import generateReceiptNumber from "@/lib/generateReceiptNumber";

export async function POST(req) {

  try {

    await dbConnect();

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    /* ================= FIND ORDER ================= */

    const order =
      await Order.findOne({
        orderId,
      });

    if (!order) {

      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    /* ================= ALREADY PAID ================= */

    if (
      order.payment?.status ===
      "SUCCESS"
    ) {

      return NextResponse.json({
        success: true,
        alreadyPaid: true,
      });
    }

    /* ================= GENERATE DOC NUMBERS ================= */

    const invoiceNumber =
      await generateInvoiceNumber(
        Company,
        Order
      );

    const receiptNumber =
      await generateReceiptNumber(
        Company,
        Order
      );

    /* ================= PAYMENT ================= */

    order.payment.status =
      "SUCCESS";

    order.payment.amountPaid =
      order.amount || 0;

    order.payment.razorpay_payment_id =
      razorpay_payment_id;

    order.payment.razorpay_order_id =
      razorpay_order_id;

    order.payment.razorpay_signature =
      razorpay_signature;

    order.payment.transactionId =
      razorpay_payment_id;

    order.payment.paidAt =
      new Date();

    order.receipt = {
      receiptNumber,
      generatedAt: new Date(),
      amountPaid: order.amount,
      paymentMode: order.payment.method,
    };

    order.payment.logs.push({
      status: "SUCCESS",
      message:
        "Razorpay payment successful",
      at: new Date(),
    });

    /* ================= STATUS ================= */

    order.status = "PAID";

    order.statusTimeline.paidAt =
      new Date();

    /* ================= INVOICE ================= */

    order.invoice = {

      invoiceNumber,

      generatedAt: new Date(),

      invoiceUrl:
        `/invoice/${order.orderId}`,

      billingSnapshot:
        order.billing,
    };

    /* ================= RECEIPT ================= */

    order.receipt = {

      receiptNumber,

      generatedAt: new Date(),

      amountPaid:
        order.amount || 0,

      paymentMode:
        order.payment.method,

      receiptUrl:
        `/receipt/${order.orderId}`,
    };

    /* ================= AUDIT ================= */

    order.auditLogs.push({

      action: "PAYMENT_SUCCESS",

      from: "PENDING_PAYMENT",

      to: "PAID",

      by: "SYSTEM",

      meta: {
        paymentId:
          razorpay_payment_id,
      },

      at: new Date(),
    });

    /* ================= SAVE ================= */

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
    });

  } catch (err) {

    console.error(
      "PAYMENT VERIFY ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Payment verify failed",
      },
      { status: 500 }
    );
  }
}
