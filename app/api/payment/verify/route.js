import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {

  try {

    await dbConnect();

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
    } = await req.json();

    const order =
      await Order.findOne({ orderId });

    if (!order) {

      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    /* ================= PAYMENT ================= */

    order.payment.status =
      "SUCCESS";

    order.payment.razorpay_payment_id =
      razorpay_payment_id;

    order.payment.razorpay_order_id =
      razorpay_order_id;

    order.payment.paidAt =
      new Date();

    order.payment.logs.push({

      status: "SUCCESS",

      message:
        "Razorpay payment successful",

      at: new Date(),

    });

    /* ================= ORDER ================= */

    order.status = "PAID";

    order.statusTimeline = {
      ...order.statusTimeline,
      paidAt: new Date(),
    };

    /* ================= AUDIT ================= */

    order.auditLogs.push({

      action:
        "PAYMENT_SUCCESS",

      by: "SYSTEM",

      at: new Date(),

      meta: {
        razorpay_payment_id,
      },
    });

    await order.save();

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.error(
      "VERIFY ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Verification failed",
      },
      { status: 500 }
    );
  }
}
