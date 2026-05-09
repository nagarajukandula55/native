export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  getShiprocketToken,
} from "@/lib/shiprocket";

const BASE_URL =
  "https://apiv2.shiprocket.in/v1/external";

/* =========================================
   GET SHIPPING RATES
========================================= */

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
       TOKEN
    ========================================= */

    const token =
      await getShiprocketToken();

    /* =========================================
       REQUEST
    ========================================= */

    const pickupPincode =
      process.env
        .SHIPROCKET_PICKUP_PINCODE;

    const deliveryPincode =
      order.address?.pincode;

    const weight =
      order.shipping
        ?.packageWeight || 0.5;

    const cod =
      order.payment?.method === "COD"
        ? 1
        : 0;

    const response = await fetch(

      `${BASE_URL}/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&cod=${cod}&weight=${weight}`,

      {
        method: "GET",

        headers: {

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },
      }
    );

    const data =
      await response.json();

    console.log(
      "🚚 COURIER RATES:",
      data
    );

    if (!response.ok) {

      return NextResponse.json(
        {
          success: false,
          message:
            data?.message ||
            "Failed to fetch rates",
        },
        { status: 500 }
      );
    }

    const couriers =
      data?.data?.available_courier_companies || [];

    /* =========================================
       SORT LOWEST PRICE
    ========================================= */

    couriers.sort(
      (a, b) =>
        Number(a.rate || 0) -
        Number(b.rate || 0)
    );

    return NextResponse.json({

      success: true,

      couriers:
        couriers.map((c) => ({

          courierId:
            c.courier_company_id,

          courierName:
            c.courier_name,

          rate:
            c.rate,

          etd:
            c.etd,

          estimatedDays:
            c.estimated_delivery_days,

          air:
            c.airwaybill_genrated,

          cod:
            c.cod,

          rank:
            c.rank,

          shippingType:
            c.transportation_mode,

          rating:
            c.rating,
        })),
    });

  } catch (err) {

    console.log(
      "SHIPPING RATE ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Rate fetch failed",
      },
      { status: 500 }
    );
  }
}
