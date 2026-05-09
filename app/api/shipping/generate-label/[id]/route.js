export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

/* =========================================
   GENERATE SHIPPING LABEL
========================================= */

export async function GET(
  req,
  { params }
) {

  try {

    await dbConnect();

    const { id } =
      params;

    /* =========================================
       FIND ORDER
    ========================================= */

    const order =
      await Order.findOne({
        orderId: id,
      }).lean();

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
       LABEL CHECK
    ========================================= */

    const labelUrl =

      order.shipping
        ?.labelUrl;

    if (!labelUrl) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Shipping label not generated",
        },
        { status: 400 }
      );
    }

    /* =========================================
       FETCH LABEL PDF
    ========================================= */

    const response =
      await fetch(labelUrl);

    if (!response.ok) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to fetch shipping label",
        },
        { status: 500 }
      );
    }

    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    /* =========================================
       RETURN PDF
    ========================================= */

    return new NextResponse(
      buffer,
      {

        headers: {

          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename=${order.orderId}-shipping-label.pdf`,
        },
      }
    );

  } catch (err) {

    console.log(
      "LABEL ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,

        message:
          err.message ||
          "Failed to generate label",
      },
      { status: 500 }
    );
  }
}
