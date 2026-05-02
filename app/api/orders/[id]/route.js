import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

/* ================= SAFE ORDER RESOLVER ================= */
async function resolveOrder(id) {
  if (!id) return null;

  let order = null;

  /* ================= CASE 1: Mongo ID ================= */
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    order = await Order.findById(id);
    if (order) return order;
  }

  /* ================= CASE 2: EXACT ORDER ID (PRIMARY) ================= */
  order = await Order.findOne({ orderId: id });
  if (order) return order;

  /* ================= CASE 3: SAFE PREFIX MATCH (STRICT) ================= */
  if (id.includes("-")) {
    const parts = id.split("-");

    // 🔒 STRICT LIMIT: only first 3 segments (prevents wrong matches)
    const baseId = parts.slice(0, 3).join("-");

    order = await Order.findOne({
      orderId: { $regex: new RegExp(`^${baseId}`) },
    });

    if (order) return order;
  }

  return null;
}

/* ================= GET ORDER ================= */
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

    const o = order.toObject();

    /* ================= SAFE RESPONSE ENFORCEMENT ================= */
    return NextResponse.json({
      success: true,

      order: {
        ...o,

        /* 🔥 CRITICAL FIX: prevent UI "Generating..." issues */
        receipt: o.receipt || {
          receiptNumber: null,
          generatedAt: null,
          paymentReference: null,
        },

        invoice: o.invoice || null,

        payment: o.payment || null,
        items: o.items || [],
        address: o.address || {},
      },
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
