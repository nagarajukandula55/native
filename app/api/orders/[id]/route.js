import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const id = params.id;

    let order = null;

    /* ================= CASE 1: Mongo ID ================= */
    if (id.length === 24) {
      order = await Order.findById(id);
    }

    /* ================= CASE 2: FULL ORDER ID ================= */
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    /* ================= CASE 3: STRIP RANDOM SUFFIX ================= */
    if (!order && id.includes("-")) {
      const baseId = id.split("-").slice(0, 3).join("-");

      order = await Order.findOne({
        orderId: { $regex: `^${baseId}` },
      });
    }

    /* ================= NOT FOUND ================= */
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
