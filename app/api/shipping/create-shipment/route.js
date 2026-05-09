export const runtime = "nodejs";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  createShipment,
} from "@/lib/shiprocket";

export async function POST(req) {

  try {

    await dbConnect();

    const {
      orderId,
      courier_id,
    } = await req.json();

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

    const payload = {

      order_id:
        order.orderId,

      order_date:
        new Date(
          order.createdAt
        ).toISOString(),

      billing_customer_name:
        order.address?.name,

      billing_phone:
        order.address?.phone,

      billing_address:
        order.address?.address,

      billing_city:
        order.address?.city,

      billing_state:
        order.address?.state,

      billing_pincode:
        order.address?.pincode,

      billing_country:
        "India",

      shipping_is_billing: true,

      order_items:
        order.items.map(
          (i) => ({
            name: i.name,
            sku:
              i.productKey,
            units: i.qty,
            selling_price:
              i.price,
          })
        ),

      payment_method:
        order.payment?.method ===
        "COD"
          ? "COD"
          : "Prepaid",

      sub_total:
        order.amount,

      length:
        order.shipping
          ?.dimensions
          ?.length || 10,

      breadth:
        order.shipping
          ?.dimensions
          ?.breadth || 10,

      height:
        order.shipping
          ?.dimensions
          ?.height || 10,

      weight:
        order.shipping
          ?.packageWeight || 0.5,
    };

    const shipment =
      await createShipment(
        payload
      );

    console.log(
      "SHIPROCKET:",
      shipment
    );

    const awb =
      shipment?.awb_code ||
      shipment?.shipment_id;

    order.shipping = {

      ...order.shipping,

      dispatchType:
        "COURIER",

      awbNumber: awb,

      shipmentId:
        shipment?.shipment_id,

      courierPartner:
        shipment?.courier_name,

      trackingUrl:
        shipment?.tracking_url,

      pickupScheduled: true,
    };

    await order.save();

    return NextResponse.json({
      success: true,
      shipment,
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
          err.message,
      },
      { status: 500 }
    );
  }
}
