import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();

    console.log("📦 FETCH ORDERS API HIT");

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    console.log("📦 ORDERS COUNT:", orders.length);

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (err) {
    console.error("🔴 LIST ORDERS ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
