import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";

export const dynamic = "force-dynamic";

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

    /* 🚫 IF ALREADY ASSIGNED */
    if (order.warehouseAssignments?.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Already assigned",
        assignments: order.warehouseAssignments,
      });
    }

    const assignments = [];

    /* ================= ASSIGN BASED ON RESERVED STOCK ================= */
    for (const item of order.items) {

      const inventories = await Inventory.find({
        productId: item.productId,
        reservedQty: { $gte: item.quantity }, // 🔥 KEY FIX
      }).sort({ reservedQty: -1 });

      if (!inventories.length) {
        return NextResponse.json(
          {
            success: false,
            message: `No reserved stock for product ${item.name}`,
          },
          { status: 400 }
        );
      }

      const inv = inventories[0];

      assignments.push({
        productId: item.productId,
        warehouseId: inv.warehouseId,
        quantity: item.quantity,
      });
    }

    /* ================= SAVE ================= */
    order.warehouseAssignments = assignments;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Warehouse assigned successfully",
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
