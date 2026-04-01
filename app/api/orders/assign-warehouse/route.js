export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";

export async function POST(req) {
  try {
    await connectDB();

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const assignments = [];

    for (const item of order.items) {
      const inventories = await Inventory.find({
        productId: item.productId,
        availableQty: { $gt: 0 },
      }).sort({ availableQty: -1 });

      let remaining = item.quantity;

      for (const inv of inventories) {
        const allocate = Math.min(remaining, inv.availableQty);

        if (allocate <= 0) continue;

        // 🔥 reserve stock
        inv.availableQty -= allocate;
        inv.reservedQty += allocate;
        await inv.save();

        assignments.push({
          warehouseId: inv.warehouseId,
          productId: item.productId,
          quantity: allocate,
        });

        remaining -= allocate;
        if (remaining <= 0) break;
      }

      if (remaining > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for product ${item.productId}`,
          },
          { status: 400 }
        );
      }
    }

    order.warehouseAssignments = assignments;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Warehouse assigned",
      assignments,
    });

  } catch (err) {
    console.error("ASSIGN ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
