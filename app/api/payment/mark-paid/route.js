import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {

  try {

    await dbConnect();

    const body = await req.json();

    const {
      orderId,
      utr,
    } = body;

    console.log(
      "🟡 MARK PAID HIT:",
      body
    );

    /* ================= VALIDATION ================= */

    if (!orderId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "OrderId required",
        },
        { status: 400 }
      );
    }

    /* ================= FIND ORDER ================= */

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

    /* ================= ALREADY PAID ================= */

    if (
      order.payment?.status ===
      "SUCCESS"
    ) {

      return NextResponse.json({

        success: true,

        message:
          "Already marked as paid",

        orderId:
          order.orderId,

      });
    }

    const prevStatus =
      order.status;

    /* ================= PAYMENT UPDATE ================= */

    order.payment = {

      ...order.payment,

      status: "SUCCESS",

      method:
        order.payment?.method ||
        "MANUAL",

      utr:
        utr || null,

      amountPaid:
        order.billing?.grandTotal ||
        order.amount ||
        0,

      paidAt:
        new Date(),

      logs: [

        ...(order.payment?.logs || []),

        {
          status: "SUCCESS",

          message:
            "Marked paid manually by admin",

          at: new Date(),
        },
      ],
    };

    /* ================= ORDER STATUS ================= */

    order.status = "PAID";

    /* ================= STATUS TIMELINE ================= */

    order.statusTimeline = {

      ...order.statusTimeline,

      paidAt:
        new Date(),
    };

    /* ================= AUDIT LOG ================= */

    order.auditLogs.push({

      action:
        "MANUAL_PAYMENT_MARKED",

      from:
        prevStatus,

      to:
        "PAID",

      by:
        "ADMIN",

      at:
        new Date(),

      meta: {

        utr:
          utr || null,
      },
    });

    /* ================= SAVE ================= */

    await order.save();

    console.log(
      "🟢 ORDER MARKED PAID:",
      order.orderId
    );

    /* ================= RESPONSE ================= */

    return NextResponse.json({

      success: true,

      orderId:
        order.orderId,

      paymentStatus:
        order.payment.status,

      orderStatus:
        order.status,
    });

  } catch (err) {

    console.error(
      "🔴 MARK PAID ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,

        message:
          err.message ||
          "Failed to mark paid",
      },
      { status: 500 }
    );
  }
}
