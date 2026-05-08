export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import Company from "@/models/CompanySettings";

import generateInvoiceNumber from "@/lib/generateInvoiceNumber";
import generateReceiptNumber from "@/lib/generateReceiptNumber";

import {
  sendInvoiceEmail,
  sendReceiptEmail,
} from "@/lib/email";

export async function POST(req) {

  try {

    await dbConnect();

    const body = await req.json();

    const {
      orderId,
      status,
      transactionId,
      dispatchType,
      courierPartner,
      awbNumber,
      trackingUrl,
      by = "ADMIN",
    } = body;

    if (!orderId || !status) {

      return NextResponse.json(
        {
          success: false,
          message:
            "orderId & status required",
        },
        { status: 400 }
      );
    }

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

    const prevStatus = order.status;

    /* =======================================
       MARK PAID
    ======================================= */

    if (status === "PAID") {

      if (
        order.payment?.status !==
        "SUCCESS"
      ) {

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

        order.payment.status =
          "SUCCESS";

        order.payment.amountPaid =
          order.amount || 0;

        order.payment.transactionId =
          transactionId || "";

        order.payment.paidAt =
          new Date();

        order.payment.logs.push({
          status: "SUCCESS",
          message:
            "Payment marked successful",
          at: new Date(),
        });

        order.status = "PAID";

        order.statusTimeline.paidAt =
          new Date();

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

        /* ================= PREPARE INVOICE ================= */

        order.invoice = {

          invoiceNumber,

          generatedAt: new Date(),

          invoiceUrl:
            `/invoice/${order.orderId}`,

          billingSnapshot:
            order.billing,
        };

        order.auditLogs.push({

          action:
            "PAYMENT_MARKED_SUCCESS",

          from: prevStatus,

          to: "PAID",

          by,

          meta: {
            transactionId,
          },

          at: new Date(),
        });

        await order.save();

        /* ================= EMAIL ================= */

        try {

          await sendReceiptEmail({
            to:
              order.address?.email,
            order,
          });

          order.receiptEmailSent =
            true;

          await order.save();

        } catch (mailErr) {

          console.log(
            "RECEIPT EMAIL ERROR:",
            mailErr
          );
        }
      }
    }

    /* =======================================
       PROCESSING
    ======================================= */

    if (status === "PROCESSING") {

      order.status =
        "PROCESSING";

      order.statusTimeline.processedAt =
        new Date();

      order.auditLogs.push({

        action:
          "ORDER_PROCESSING",

        from: prevStatus,

        to: "PROCESSING",

        by,

        at: new Date(),
      });

      await order.save();
    }

    /* =======================================
       PACKED
    ======================================= */

    if (status === "PACKED") {

      order.status =
        "PACKED";

      order.warehouse.status =
        "PACKED";

      order.warehouse.packedAt =
        new Date();

      order.statusTimeline.packedAt =
        new Date();

      order.auditLogs.push({

        action:
          "ORDER_PACKED",

        from: prevStatus,

        to: "PACKED",

        by,

        at: new Date(),
      });

      await order.save();

      /* ================= SEND INVOICE ================= */

      try {

        await sendInvoiceEmail({
          to:
            order.address?.email,
          order,
        });

        order.invoiceEmailSent =
          true;

        await order.save();

      } catch (mailErr) {

        console.log(
          "INVOICE EMAIL ERROR:",
          mailErr
        );
      }
    }

    /* =======================================
       AWB GENERATED
    ======================================= */

    if (status === "AWB_GENERATED") {

      order.status =
        "AWB_GENERATED";

      order.shipping.dispatchType =
        dispatchType || "COURIER";

      order.shipping.courierPartner =
        courierPartner || "";

      order.shipping.awbNumber =
        awbNumber || "";

      order.shipping.trackingUrl =
        trackingUrl || "";

      order.statusTimeline.awbGeneratedAt =
        new Date();

      order.auditLogs.push({

        action:
          "AWB_GENERATED",

        from: prevStatus,

        to: "AWB_GENERATED",

        by,

        meta: {
          awbNumber,
          courierPartner,
        },

        at: new Date(),
      });

      await order.save();
    }

    /* =======================================
       DISPATCHED
    ======================================= */

    if (status === "DISPATCHED") {

      order.status =
        "DISPATCHED";

      order.warehouse.status =
        "DISPATCHED";

      order.warehouse.dispatchedAt =
        new Date();

      order.statusTimeline.dispatchedAt =
        new Date();

      order.auditLogs.push({

        action:
          "ORDER_DISPATCHED",

        from: prevStatus,

        to: "DISPATCHED",

        by,

        at: new Date(),
      });

      await order.save();
    }

    /* =======================================
       DELIVERED
    ======================================= */

    if (status === "DELIVERED") {

      order.status =
        "DELIVERED";

      order.warehouse.status =
        "DELIVERED";

      order.warehouse.deliveredAt =
        new Date();

      order.shipping.deliveredAt =
        new Date();

      order.statusTimeline.deliveredAt =
        new Date();

      order.auditLogs.push({

        action:
          "ORDER_DELIVERED",

        from: prevStatus,

        to: "DELIVERED",

        by,

        at: new Date(),
      });

      await order.save();
    }

    return NextResponse.json({

      success: true,

      orderId: order.orderId,

      status: order.status,
    });

  } catch (err) {

    console.log(
      "WAREHOUSE STATUS ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed",
      },
      { status: 500 }
    );
  }
}
