export const runtime = "nodejs";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import { updateOrderStatus }
from "@/lib/orderStatusManager";

export async function POST(req) {

  try {

    await dbConnect();

    const {
      orderId,
      status,
    } = await req.json();

    if (!orderId || !status) {

      return NextResponse.json(
        {
          success: false,
          message:
            "orderId & status required",
        },
        { status: 400 }
      );
    }

    const order =
      await updateOrderStatus({
        orderId,
        status,
        meta: {
          by: "ADMIN",
        },
      });

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (err) {

    console.log(err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
