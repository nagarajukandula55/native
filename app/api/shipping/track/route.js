export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  trackShipment,
} from "@/lib/shiprocket";

export async function POST(req) {

  try {

    await dbConnect();

    const body =
      await req.json();

    const { awb } = body;

    if (!awb) {

      return NextResponse.json(
        {
          success: false,
          message: "AWB required",
        },
        { status: 400 }
      );
    }

    /* ================= TRACK ================= */

    const tracking =
      await trackShipment(awb);

    console.log(
      "📍 TRACKING:",
      tracking
    );

    const shipment =
      tracking?.tracking_data
        ?.shipment_track?.[0];

    if (!shipment) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Tracking not found",
        },
        { status: 404 }
      );
    }

    /* ================= FIND ORDER ================= */

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
            "Order not linked",
        },
        { status: 404 }
      );
    }

    /* ================= UPDATE ================= */

    order.shipping.trackingStatus =

      shipment.current_status ||

      shipment.delivery_status ||

      "IN_TRANSIT";

    order.shipping.trackingUrl =

      shipment.tracking_url ||

      order.shipping.trackingUrl;

    /* ================= DELIVERED ================= */

    const status =
      String(
        shipment.current_status || ""
      ).toUpperCase();

    if (
      status.includes("DELIVERED")
    ) {

      order.status =
        "DELIVERED";

      order.warehouse.status =
        "DELIVERED";

      order.shipping.deliveredAt =
        new Date();

      order.statusTimeline.deliveredAt =
        new Date();

      order.auditLogs.push({

        action:
          "AUTO_DELIVERED",

        by:
          "SHIPROCKET_WEBHOOK",

        at:
          new Date(),
      });
    }

    await order.save();

    return NextResponse.json({

      success: true,

      tracking:
        shipment,

      status:
        order.shipping
          ?.trackingStatus,
    });

  } catch (err) {

    console.log(
      "TRACK ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Tracking failed",
      },
      { status: 500 }
    );
  }
}
