export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  cancelShipment,
} from "@/lib/shiprocket";

import {
  sendTelegramMessage,
} from "@/lib/telegram";

/* =========================================
   CANCEL SHIPMENT
========================================= */

export async function POST(req) {

  try {

    await dbConnect();

    const body =
      await req.json();

    const {
      orderId,
      reason = "",
    } = body;

    /* =========================================
       VALIDATION
    ========================================= */

    if (!orderId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Order ID required",
        },
        { status: 400 }
      );
    }

    /* =========================================
       FIND ORDER
    ========================================= */

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

    /* =========================================
       AWB CHECK
    ========================================= */

    if (
      !order.shipping?.awbNumber
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "AWB not generated",
        },
        { status: 400 }
      );
    }

    /* =========================================
       SHIPROCKET CANCEL
    ========================================= */

    const cancelResponse =
      await cancelShipment(
        order.shipping.awbNumber
      );

    console.log(
      "🚫 CANCEL RESPONSE:",
      cancelResponse
    );

    /* =========================================
       UPDATE ORDER
    ========================================= */

    order.shipping = {

      ...order.shipping,

      trackingStatus:
        "SHIPMENT_CANCELLED",

      cancelledAt:
        new Date(),

      cancellationReason:
        reason || "",
    };

    /* =========================================
       ROLLBACK STATUS
    ========================================= */

    order.status =
      "PACKED";

    order.warehouse.status =
      "PACKED";

    /* =========================================
       AUDIT
    ========================================= */

    order.auditLogs.push({

      action:
        "SHIPMENT_CANCELLED",

      by:
        "ADMIN",

      meta: {

        awb:
          order.shipping.awbNumber,

        reason,

        response:
          cancelResponse,
      },

      at:
        new Date(),
    });

    await order.save();

    /* =========================================
       TELEGRAM
    ========================================= */

    try {

      await sendTelegramMessage(`

🚫 SHIPMENT CANCELLED

🧾 Order:
${order.orderId}

👤 Customer:
${order.address?.name}

📦 AWB:
${order.shipping?.awbNumber}

📝 Reason:
${reason || "N/A"}

      `);

    } catch (tgErr) {

      console.log(
        "TELEGRAM ERROR:",
        tgErr
      );
    }

    /* =========================================
       RESPONSE
    ========================================= */

    return NextResponse.json({

      success: true,

      message:
        "Shipment cancelled",

      response:
        cancelResponse,
    });

  } catch (err) {

    console.log(
      "CANCEL SHIPMENT ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,

        message:
          err.message ||
          "Shipment cancel failed",
      },
      { status: 500 }
    );
  }
}
