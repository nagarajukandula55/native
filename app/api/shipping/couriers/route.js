export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  getCourierServices,
} from "@/lib/shiprocket";

/* =========================================
   GET AVAILABLE COURIERS
========================================= */

export async function POST(req) {

  try {

    await dbConnect();

    const body =
      await req.json();

    const {
      orderId,
    } = body;

    /* =====================================
       VALIDATION
    ===================================== */

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

    /* =====================================
       ORDER
    ===================================== */

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

    /* =====================================
       SHIPROCKET
    ===================================== */

    const response =
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
          Number(
            order.shipping
              ?.packageWeight
          ) || 0.5,

        declared_value:
          Number(
            order.amount
          ) || 1,
      });

    console.log(
      "🚚 COURIERS:",
      JSON.stringify(
        response,
        null,
        2
      )
    );

    /* =====================================
       RAW LIST
    ===================================== */

    let available =
      response?.data
        ?.available_courier_companies || [];

    /* =====================================
       EMPTY
    ===================================== */

    if (!available.length) {

      return NextResponse.json(
        {
          success: false,
          message:
            "No courier available",
        },
        { status: 404 }
      );
    }

    /* =====================================
       SORT CHEAPEST FIRST
    ===================================== */

    available.sort(
      (a, b) =>
        Number(a.rate || 0) -
        Number(b.rate || 0)
    );

    /* =====================================
       FORMAT
    ===================================== */

    const couriers =
      available.map((c, index) => ({

        courier_name:
          c.courier_name,

        courier_company_id:
          c.courier_company_id,

        rate:
          Number(
            c.rate || 0
          ),

        etd:
          c.etd || "",

        estimated_delivery_days:
          c.estimated_delivery_days || "",

        cod:
          !!c.cod,

        air:
          !c.is_surface,

        surface:
          !!c.is_surface,

        rating:
          c.rating || null,

        freight_charge:
          c.freight_charge || 0,

        rto_charges:
          c.rto_charges || 0,

        insurance_charges:
          c.insurance_charges || 0,

        pickup_performance:
          c.pickup_performance || "",

        tracking_supported: true,

        recommended:
          index === 0,
      }));

    /* =====================================
       SUCCESS
    ===================================== */

    return NextResponse.json({

      success: true,

      total:
        couriers.length,

      recommended:
        couriers[0] || null,

      couriers,
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
