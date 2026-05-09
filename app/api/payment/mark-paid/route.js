export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";

import {
  sendTelegramMessage,
} from "@/lib/telegram";

export async function POST(req) {

  try {

    await dbConnect();

    const body =
      await req.json();

    const {
      orderId,
      utr,
    } = body;

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

    order.payment.status =
      "SUCCESS";

    order.payment.utr =
      utr || "";

    order.payment.paidAt =
      new Date();

    order.payment.logs.push({

      status: "SUCCESS",

      message:
        "Payment marked manually",

      at: new Date(),
    });

    order.status = "PAID";

    order.statusTimeline.paidAt =
      new Date();

    order.auditLogs.push({

      action:
        "PAYMENT_MARKED_SUCCESS",

      by: "ADMIN",

      meta: {
        utr,
      },

      at: new Date(),
    });

    await order.save();

    try {

      await sendTelegramMessage(`

💰 PAYMENT RECEIVED

🧾 ${order.orderId}

👤 ${order.address?.name}

₹ ${order.amount}

UTR:
${utr || "-"}

      `);

    } catch (e) {}

    return NextResponse.json({

      success: true,
    });

  } catch (err) {

    console.log(
      "MARK PAID ERROR:",
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
