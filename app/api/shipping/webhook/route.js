export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  sendTelegramMessage,
} from "@/lib/telegram";

import {
  sendShipmentDeliveredEmail,
} from "@/lib/email";

/* =========================================
   SHIPROCKET / COURIER WEBHOOK
========================================= */

export async function POST(req) {

  try {

    await dbConnect();

    const payload = await req.json();

    console.log(
      "🚚 SHIPPING WEBHOOK:",
      JSON.stringify(payload, null, 2)
    );

    /*
      Shiprocket usually sends:
      awb
      current_status
      shipment_status
      courier_name
    */

    const awb =
      payload?.awb ||
      payload?.awb_code ||
      payload?.data?.awb;

    const currentStatus =
      payload?.current_status ||
      payload?.shipment_status ||
      payload?.status ||
      "";

    if (!awb) {

      return NextResponse.json(
        {
          success: false,
          message: "AWB missing",
        },
        { status: 400 }
      );
    }

    /* =========================================
       FIND ORDER
    ========================================= */

    const order =
      await Order.findOne({
        "shipping.awbNumber": awb,
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

    /* =========================================
       UPDATE TRACKING
    ========================================= */

    order.shipping = {

      ...order.shipping,

      trackingStatus:
        currentStatus,

      lastTrackingWebhook:
        payload,
    };

    /* =========================================
       DELIVERY DETECT
    ========================================= */

    const deliveredStatuses = [

      "Delivered",

      "DELIVERED",

      "Shipment Delivered",

      "Order Delivered",
    ];

    if (
      deliveredStatuses.includes(
        currentStatus
      )
    ) {

      order.status =
        "DELIVERED";

      order.shipping.deliveredAt =
        new Date();

      order.statusTimeline.deliveredAt =
        new Date();

      order.warehouse.status =
        "DELIVERED";

      order.auditLogs.push({

        action:
          "DELIVERY_WEBHOOK_RECEIVED",

        from:
          "DISPATCHED",

        to:
          "DELIVERED",

        by:
          "COURIER_WEBHOOK",

        meta: {
          awb,
          status:
            currentStatus,
        },

        at:
          new Date(),
      });

      /* =========================================
         EMAIL
      ========================================= */

      try {

        if (
          order.address?.email
        ) {

          await sendShipmentDeliveredEmail({

            to:
              order.address.email,

            order,
          });
        }

      } catch (mailErr) {

        console.log(
          "DELIVERY EMAIL ERROR:",
          mailErr
        );
      }

      /* =========================================
         TELEGRAM
      ========================================= */

      try {

        await sendTelegramMessage(`

✅ ORDER DELIVERED

🧾 Order:
${order.orderId}

👤 Customer:
${order.address?.name}

📦 AWB:
${awb}

🚚 Courier:
${order.shipping?.courierPartner || "-"}

📍 Status:
${currentStatus}

        `);

      } catch (tgErr) {

        console.log(
          "TELEGRAM ERROR:",
          tgErr
        );
      }
    }

    /* =========================================
       IN TRANSIT
    ========================================= */

    else {

      order.auditLogs.push({

        action:
          "TRACKING_UPDATED",

        by:
          "COURIER_WEBHOOK",

        meta: {
          awb,
          status:
            currentStatus,
        },

        at:
          new Date(),
      });
    }

    /* =========================================
       SAVE
    ========================================= */

    await order.save();

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.log(
      "SHIPPING WEBHOOK ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message,
      },
      { status: 500 }
    );
  }
}
