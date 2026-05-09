export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {

  createShiprocketShipment,

  assignAWB,

  generateLabel,

  generateManifest,

  schedulePickup,

} from "@/lib/shiprocket";

import {
  sendTelegramMessage,
} from "@/lib/telegram";

import {

  sendShipmentCreatedEmail,

} from "@/lib/email";

/* =========================================
   CREATE SHIPMENT
========================================= */

export async function POST(req) {

  try {

    await dbConnect();

    const body =
      await req.json();

    const {

      orderId,

      courierId,

      dispatchType,

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
       ALREADY SHIPPED
    ========================================= */

    if (
      order.shipping?.awbNumber
    ) {

      return NextResponse.json({
        success: true,
        alreadyCreated: true,

        awb:
          order.shipping
            ?.awbNumber,
      });
    }

    /* =========================================
       BY HAND DELIVERY
    ========================================= */

    if (
      dispatchType ===
      "BY_HAND"
    ) {

      order.shipping = {

        ...order.shipping,

        dispatchType:
          "BY_HAND",

        trackingStatus:
          "HAND_DELIVERY",
      };

      order.status =
        "DISPATCHED";

      order.warehouse.status =
        "DISPATCHED";

      order.statusTimeline.dispatchedAt =
        new Date();

      order.auditLogs.push({

        action:
          "HAND_DELIVERY_SELECTED",

        by:
          "WAREHOUSE",

        at:
          new Date(),
      });

      await order.save();

      return NextResponse.json({
        success: true,
        dispatchType:
          "BY_HAND",
      });
    }

    /* =========================================
       CREATE SHIPMENT
    ========================================= */

    const shipment =
      await createShiprocketShipment(
        order
      );

    console.log(
      "🚚 SHIPMENT:",
      shipment
    );

    const shipmentId =

      shipment?.shipment_id ||

      shipment?.shipment_details
        ?.shipment_id ||

      shipment?.payload
        ?.shipment_id;

    if (!shipmentId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Shipment ID missing",
          shipment,
        },
        { status: 500 }
      );
    }

    /* =========================================
       ASSIGN AWB
    ========================================= */

    let awbData = null;

    if (courierId) {

      awbData =
        await assignAWB(
          shipmentId,
          courierId
        );
    }

    console.log(
      "📦 AWB DATA:",
      awbData
    );

    const awbNumber =

      awbData?.response
        ?.data?.awb_code ||

      awbData?.awb_code ||

      "";

    const courierName =

      awbData?.response
        ?.data
        ?.courier_name ||

      "";

    /* =========================================
       LABEL
    ========================================= */

    const labelData =
      await generateLabel(
        shipmentId
      );

    console.log(
      "🏷 LABEL:",
      labelData
    );

    const labelUrl =

      labelData?.label_url ||

      labelData?.response
        ?.label_url ||

      "";

    /* =========================================
       MANIFEST
    ========================================= */

    const manifest =
      await generateManifest(
        shipmentId
      );

    console.log(
      "📄 MANIFEST:",
      manifest
    );

    /* =========================================
       PICKUP
    ========================================= */

    const pickup =
      await schedulePickup(
        shipmentId
      );

    console.log(
      "🚛 PICKUP:",
      pickup
    );

    /* =========================================
       SAVE ORDER
    ========================================= */

    order.shipping = {

      ...order.shipping,

      dispatchType:
        "COURIER",

      shipmentId:
        String(shipmentId),

      courierPartner:
        courierName,

      awbNumber,

      labelUrl,

      pickupScheduled:
        true,

      pickupAt:
        new Date(),

      trackingStatus:
        "AWB_GENERATED",
    };

    order.status =
      "DISPATCHED";

    order.warehouse.status =
      "DISPATCHED";

    order.statusTimeline.dispatchedAt =
      new Date();

    order.auditLogs.push({

      action:
        "SHIPMENT_CREATED",

      by:
        "WAREHOUSE",

      meta: {

        awb:
          awbNumber,

        shipmentId,

        courier:
          courierName,
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

🚚 SHIPMENT CREATED

🧾 Order:
${order.orderId}

👤 Customer:
${order.address?.name}

📦 AWB:
${awbNumber}

🚛 Courier:
${courierName}

💰 Amount:
₹${order.amount}

      `);

    } catch (tgErr) {

      console.log(
        "TELEGRAM ERROR:",
        tgErr
      );
    }

    /* =========================================
       EMAIL
    ========================================= */

    try {

      if (
        order.address?.email
      ) {

        await sendShipmentCreatedEmail({

          to:
            order.address.email,

          order,
        });
      }

    } catch (mailErr) {

      console.log(
        "SHIPMENT EMAIL ERROR:",
        mailErr
      );
    }

    /* =========================================
       RESPONSE
    ========================================= */

    return NextResponse.json({

      success: true,

      orderId:
        order.orderId,

      awb:
        awbNumber,

      courier:
        courierName,

      shipmentId,

      labelUrl,
    });

  } catch (err) {

    console.log(
      "CREATE SHIPMENT ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,

        message:
          err.message ||
          "Shipment failed",
      },
      { status: 500 }
    );
  }
}
