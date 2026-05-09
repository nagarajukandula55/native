export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  trackShipment,
} from "@/lib/shiprocket";

/* =========================================
   TRACK SHIPMENT
========================================= */

export async function GET(
  req,
  { params }
) {

  try {

    await dbConnect();

    const { awb } =
      params;

    if (!awb) {

      return NextResponse.json(
        {
          success: false,
          message:
            "AWB required",
        },
        { status: 400 }
      );
    }

    /* =========================================
       TRACK FROM SHIPROCKET
    ========================================= */

    const tracking =
      await trackShipment(
        awb
      );

    console.log(
      "📦 TRACKING:",
      JSON.stringify(
        tracking,
        null,
        2
      )
    );

    /* =========================================
       FIND ORDER
    ========================================= */

    const order =
      await Order.findOne({
        "shipping.awbNumber":
          awb,
      });

    /* =========================================
       UPDATE ORDER TRACKING
    ========================================= */

    if (order) {

      const activities =

        tracking?.tracking_data
          ?.shipment_track_activities ||

        [];

      const latest =

        activities?.[0] || {};

      const currentStatus =

        latest?.activity ||

        tracking?.tracking_data
          ?.shipment_status ||

        "IN_TRANSIT";

      order.shipping = {

        ...order.shipping,

        trackingStatus:
          currentStatus,

        trackingRaw:
          tracking,
      };

      /* =========================================
         DELIVERY DETECT
      ========================================= */

      const deliveredWords = [

        "DELIVERED",

        "Delivered",

        "Shipment Delivered",
      ];

      if (
        deliveredWords.some(
          (s) =>
            String(
              currentStatus
            ).includes(s)
        )
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
            "TRACKING_SYSTEM",

          meta: {
            awb,
            status:
              currentStatus,
          },

          at:
            new Date(),
        });
      }

      await order.save();
    }

    /* =========================================
       RESPONSE
    ========================================= */

    return NextResponse.json({

      success: true,

      awb,

      tracking,
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
