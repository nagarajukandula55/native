export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {

  try {

    await dbConnect();

    const { searchParams } =
      new URL(req.url);

    const orderId =
      searchParams.get("orderId");

    if (!orderId) {

      return NextResponse.json(
        {
          success: false,
          message: "Order ID required",
        },
        { status: 400 }
      );
    }

    const order =
      await Order.findOne({
        orderId,
      }).lean();

    if (!order) {

      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({

      success: true,

      order,
    });

  } catch (err) {

    console.log(
      "GET ORDER ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}
