export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/store";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await db();

    /* ================= AUTH ================= */
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid Token" },
        { status: 401 }
      );
    }

    /* ================= STORE ================= */
    const store = await Store.findById(decoded.id);

    if (!store) {
      return NextResponse.json(
        { success: false, message: "Store not found" },
        { status: 404 }
      );
    }

    /* ================= ORDERS ================= */
    const orders = await Order.find({
      "warehouseAssignments.warehouseId": {
        $in: store.assignedWarehouses || [],
      },
    })
      .sort({ createdAt: -1 })
      .select(
        "_id orderId customerName phone totalAmount status paymentStatus paymentMethod awbNumber courierName createdAt"
      );

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("STORE ORDERS ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}
