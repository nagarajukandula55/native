export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  getCourierServices,
} from "@/lib/shiprocket";

export async function POST(req) {

  try {

    await dbConnect();

    const body =
      await req.json();

    const {
      orderId,
    } = body;

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

    /* ================= ORDER ================= */

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

    /* ================= COURIERS ================= */

    const couriers =
      await getCourierServices({

        pickup_postcode:
          process.env
            .SHIPROCKET_PICKUP_PINCODE,

        delivery_postcode:
          order.address?.pincode,

        cod:
          order.payment?.method ===
          "COD"
            ? 1
            : 0,

        weight:
          order.shipping
            ?.packageWeight || 0.5,

        declared_value:
          order.amount || 1,
      });

    console.log(
      "🚚 COURIERS:",
      couriers
    );

    const available =
      couriers?.data
        ?.available_courier_companies || [];

    return NextResponse.json({

      success: true,

      couriers:
        available.map((c) => ({

          courier_name:
            c.courier_name,

          courier_company_id:
            c.courier_company_id,

          rate:
            c.rate,

          estimated_delivery_days:
            c.estimated_delivery_days,

          etd:
            c.etd,

          cod:
            c.cod,

          surface:
            c.is_surface,

          air:
            !c.is_surface,
        })),
    });

  } catch (err) {

    console.log(
      "COURIER API ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Courier fetch failed",
      },
      { status: 500 }
    );
  }
}
