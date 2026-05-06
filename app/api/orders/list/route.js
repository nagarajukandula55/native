export const dynamic = "force-dynamic"; // 🚀 disables caching

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  console.log("📡 /api/orders/list HIT");

  try {
    /* ================= DB CONNECT ================= */
    await dbConnect();
    console.log("✅ DB Connected");

    console.log("🌍 MONGO URI:", process.env.MONGO_URI);

    /* ================= FETCH ================= */
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    console.log("📦 ORDERS COUNT:", orders.length);

    if (orders.length > 0) {
      console.log("🧾 SAMPLE ORDER:", {
        orderId: orders[0].orderId,
        amount: orders[0].amount,
        createdAt: orders[0].createdAt,
      });
    } else {
      console.log("⚠️ NO ORDERS FOUND IN DB");
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (err) {
    console.error("🔴 LIST ORDERS ERROR:", err);
    console.error("🔴 ERROR STACK:", err.stack);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch orders",
        stack: err.stack, // 👈 important for debugging
      },
      { status: 500 }
    );
  }
}
