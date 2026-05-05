import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { updateOrderStatus } from "@/lib/order/updateOrderStatus";

export async function POST(req) {
  try {
    await dbConnect();

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing params" },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus({
      orderId,
      newStatus: status,
      by: "ADMIN",
    });

    return NextResponse.json({
      success: true,
      status: order.status,
    });

  } catch (err) {
    console.error("STATUS ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
