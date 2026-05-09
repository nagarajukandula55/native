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

  sendShipmentOutForDeliveryEmail,

  sendShipmentFailedEmail,

} from "@/lib/email";

/* =========================================
   SHIPROCKET WEBHOOK
========================================= */

export async function POST(req) {

  try {

    await dbConnect();

    const payload =
      await req.json();

    console.log(
      "🚚 SHIPPING WEBHOOK:",
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    /* =====================================
       PAYLOAD
    ===================================== */

    const awb =

      payload?.awb ||

      payload?.awb_code ||

      payload?.data?.awb ||

      "";

    const currentStatus =

      payload?.current_status ||

      payload?.shipment_status ||

      payload?.status ||

      "";

    const courierName =

      payload?.courier_name ||

      payload?.data?.courier_name ||

      "";

    const trackingUrl =

      payload?.tracking_url ||

      payload?.data?.tracking_url ||

      "";

    if (!awb) {

      return NextResponse.json(
        {
          success: false,
          message:
            "AWB missing",
        },
        { status: 400 }
      );
    }

    /* =====================================
       ORDER
    ===================================== */

    const order =
      await Order.findOne({

        "shipping.awbNumber":
          awb,
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

    /* =====================================
       DUPLICATE CHECK
    ===================================== */

    const lastStatus =
      order.shipping
        ?.trackingStatus;

    if (
      lastStatus ===
      currentStatus
    ) {

      return NextResponse.json({

        success: true,

        duplicate: true,
      });
    }

    /* =====================================
       TRACKING UPDATE
    ===================================== */

    order.shipping = {

      ...order.shipping,

      courierPartner:
        courierName ||

        order.shipping
          ?.courierPartner,

      trackingStatus:
        currentStatus,

      trackingUrl:
        trackingUrl ||

        order.shipping
          ?.trackingUrl,

      lastTrackingWebhook:
        payload,
    };

    /* =====================================
       TRACKING HISTORY
    ===================================== */

    if (
      !order.shipping
        ?.trackingHistory
    ) {

      order.shipping
        .trackingHistory = [];
    }

    order.shipping
      .trackingHistory.push({

        status:
          currentStatus,

        payload,

        at:
          new Date(),
      });

    /* =====================================
       STATUS MAP
    ===================================== */

    const deliveredStatuses = [

      "Delivered",

      "DELIVERED",

      "Shipment Delivered",

      "Order Delivered",
    ];

    const ofdStatuses = [

      "Out For Delivery",

      "OFD",

      "OUT_FOR_DELIVERY",
    ];

    const transitStatuses = [

      "In Transit",

      "Shipped",

      "Manifested",

      "Pickup Scheduled",
    ];

    const failedStatuses = [

      "Delivery Failed",

      "NDR",

      "RTO Initiated",

      "Undelivered",
    ];

    /* =====================================
       OUT FOR DELIVERY
    ===================================== */

    if (
      ofdStatuses.includes(
        currentStatus
      )
    ) {

      order.status =
        "DISPATCHED";

      order.shipping.outForDeliveryAt =
        new Date();

      order.auditLogs.push({

        action:
          "OUT_FOR_DELIVERY",

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

      try {

        if (
          order.address?.email
        ) {

          await sendShipmentOutForDeliveryEmail({

            to:
              order.address.email,

            order,
          });
        }

      } catch (e) {

        console.log(
          "OFD EMAIL ERROR:",
          e
        );
      }
    }

    /* =====================================
       DELIVERED
    ===================================== */

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

      /* ================= EMAIL ================= */

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

      /* ================= TELEGRAM ================= */

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
${courierName}

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

    /* =====================================
       FAILED DELIVERY
    ===================================== */

    else if (
      failedStatuses.includes(
        currentStatus
      )
    ) {

      order.auditLogs.push({

        action:
          "DELIVERY_FAILED",

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

      try {

        if (
          order.address?.email
        ) {

          await sendShipmentFailedEmail({

            to:
              order.address.email,

            order,
          });
        }

      } catch (e) {

        console.log(
          "FAILED EMAIL ERROR:",
          e
        );
      }
    }

    /* =====================================
       TRANSIT
    ===================================== */

    else if (
      transitStatuses.includes(
        currentStatus
      )
    ) {

      order.status =
        "DISPATCHED";

      order.auditLogs.push({

        action:
          "SHIPMENT_IN_TRANSIT",

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

    /* =====================================
       GENERIC TRACK UPDATE
    ===================================== */

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

    /* =====================================
       SAVE
    ===================================== */

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
