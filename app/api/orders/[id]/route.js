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

  /* ================= CASE 2: EXACT ORDER ID ================= */
  order = await Order.findOne({ orderId: id });
  if (order) return order;

  /* ================= CASE 3: STRICT PREFIX MATCH ================= */
  if (id.includes("-")) {
    const parts = id.split("-");

    // 🔒 strict safety: only first 3 segments
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

    /* ================= FINAL SAFE RESPONSE ================= */
    return NextResponse.json({
      success: true,

      order: {
        ...o,

        /* ================= RECEIPT (NO GENERATING ISSUE EVER) ================= */
        receipt: {
          receiptNumber: o.receipt?.receiptNumber || null,
          generatedAt: o.receipt?.generatedAt || null,
          paymentReference: o.receipt?.paymentReference || null,
          amountPaid: o.receipt?.amountPaid || o.amount || 0,
        },

        /* ================= INVOICE SAFE STRUCTURE ================= */
        invoice: o.invoice || {
          invoiceNumber: null,
          generatedAt: null,
        },

        /* ================= PAYMENT SAFE STRUCTURE ================= */
        payment: o.payment || {
          status: "PENDING",
        },

        /* ================= DATA SAFETY ================= */
        items: Array.isArray(o.items) ? o.items : [],
        address: o.address || {},

        /* ================= IMPORTANT FOR UI STABILITY ================= */
        status: o.status || "UNKNOWN",

        createdAt: o.createdAt || null,
        updatedAt: o.updatedAt || null,
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
