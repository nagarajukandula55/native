import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

/* ================= SAFE ORDER RESOLVER ================= */
async function resolveOrder(id) {
  if (!id) return null;

  // CASE 1: Mongo ID
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const order = await Order.findById(id);
    if (order) return order;
  }

  // CASE 2: EXACT ORDER ID (PRIMARY SOURCE OF TRUTH)
  let order = await Order.findOne({ orderId: id });
  if (order) return order;

  // CASE 3: SAFE PREFIX MATCH (ONLY FIRST 2 SEGMENTS)
  if (id.includes("-")) {
    const parts = id.split("-");

    // safer base (prevents wrong matches)
    const baseId = parts.slice(0, Math.min(3, parts.length)).join("-");

    order = await Order.findOne({
      orderId: { $regex: new RegExp(`^${baseId}`) },
    });

    if (order) return order;
  }

  return null;
}

/* ================= GET ================= */
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const id = decodeURIComponent(params.id);

    const order = await resolveOrder(id);

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
      order: order.toObject(),
    });

  } catch (err) {
    console.error("ORDER FETCH ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
