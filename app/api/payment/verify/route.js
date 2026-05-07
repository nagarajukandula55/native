import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import Company from "@/models/CompanySettings";

import generateInvoiceNumber from "@/lib/generateInvoiceNumber";
import generateReceiptNumber from "@/lib/generateReceiptNumber";

import { sendReceiptEmail } from "@/lib/email";

/* ================= VERIFY PAYMENT ================= */

export async function POST(req) {

  try {

    await dbConnect();

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    console.log(
      "🟡 PAYMENT VERIFY START:",
      orderId
    );

    /* ================= VALIDATION ================= */

    if (!orderId) {

      return NextResponse.json(
        {
          success: false,
          message: "Order ID missing",
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

      console.log(
        "❌ ORDER NOT FOUND"
      );

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

      console.log(
        "⚠️ ORDER ALREADY PAID"
      );

      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        orderId: order.orderId,
      });
    }

    /* ================= COMPANY ================= */

    const company =
      await Company.findOne();

    /* ================= GENERATE NUMBERS ================= */

    const invoiceNumber =
      await generateInvoiceNumber(
        company,
        Order
      );

    const receiptNumber =
      await generateReceiptNumber(
        company,
        Order
      );

    console.log(
      "🧾 INVOICE:",
      invoiceNumber
    );

    console.log(
      "🧾 RECEIPT:",
      receiptNumber
    );

    /* ================= PAYMENT UPDATE ================= */

    order.payment = {

      ...order.payment,

      status: "SUCCESS",

      amountPaid:
        order.amount || 0,

      razorpay_payment_id,

      razorpay_order_id,

      razorpay_signature,

      transactionId:
        razorpay_payment_id,

      paidAt: new Date(),
    };

    /* ================= PAYMENT LOGS ================= */

    if (
      !Array.isArray(
        order.payment.logs
      )
    ) {

      order.payment.logs = [];
    }

    order.payment.logs.push({

      status: "SUCCESS",

      message:
        "Razorpay payment successful",

      at: new Date(),
    });

    /* ================= ORDER STATUS ================= */

    order.status = "PAID";

    if (!order.statusTimeline) {

      order.statusTimeline = {};
    }

    order.statusTimeline.paidAt =
      new Date();

    /* ================= INVOICE ================= */

    order.invoice = {

      invoiceNumber,

      generatedAt: new Date(),

      invoiceUrl:
        `/invoice/${order.orderId}`,

      billingSnapshot:
        order.billing || {},
    };

    /* ================= RECEIPT ================= */

    order.receipt = {

      receiptNumber,

      generatedAt: new Date(),

      amountPaid:
        order.amount || 0,

      paymentMode:
        order.payment.method ||

        "RAZORPAY",

      receiptUrl:
        `/receipt/${order.orderId}`,
    };

    /* ================= AUDIT ================= */

    if (
      !Array.isArray(
        order.auditLogs
      )
    ) {

      order.auditLogs = [];
    }

    order.auditLogs.push({

      action: "PAYMENT_SUCCESS",

      from: "PENDING_PAYMENT",

      to: "PAID",

      by: "SYSTEM",

      meta: {

        paymentId:
          razorpay_payment_id,

        razorpayOrderId:
          razorpay_order_id,
      },

      at: new Date(),
    });

    /* ================= SAVE ================= */

    await order.save();

    console.log(
      "✅ ORDER MARKED PAID:",
      order.orderId
    );

    /* ================= EMAIL ================= */

    try {

      if (order.address?.email) {

        const siteUrl =
          process.env
            .NEXT_PUBLIC_SITE_URL ||
          "https://shopnative.in";

        const receiptUrl =
          `${siteUrl}/api/receipt/${order.orderId}`;

        await sendReceiptEmail({

          to: order.address.email,

          orderId:
            order.orderId,

          receiptUrl,
        });

        console.log(
          "📧 RECEIPT EMAIL SENT"
        );
      }

    } catch (mailErr) {

      console.log(
        "❌ EMAIL ERROR:",
        mailErr
      );
    }

    /* ================= SUCCESS ================= */

    return NextResponse.json({

      success: true,

      orderId:
        order.orderId,

      invoiceNumber,

      receiptNumber,
    });

  } catch (err) {

    console.error(
      "🔴 PAYMENT VERIFY ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,

        message:
          err.message ||
          "Payment verification failed",
      },
      { status: 500 }
    );
  }
}
