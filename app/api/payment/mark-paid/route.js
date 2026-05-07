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
      utr,
    } = await req.json();

    /* ================= VALIDATION ================= */

    if (!orderId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "OrderId required",
        },
        { status: 400 }
      );
    }

    /* ================= FIND ORDER ================= */

    const order =
      await Order.findOne({
        orderId,
      });

    if (!order) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found",
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
        message:
          "Already marked paid",
      });
    }

    /* ================= GENERATE DOCS ================= */

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

    order.payment.utr =
      utr || "";

    order.payment.transactionId =
      utr || "";

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
        "Manual payment marked",
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

      action:
        "MANUAL_PAYMENT_MARKED",

      from:
        "PENDING_PAYMENT",

      to: "PAID",

      by: "ADMIN",

      meta: {
        utr,
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
      "MARK PAID ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to mark paid",
      },
      { status: 500 }
    );
  }
}
