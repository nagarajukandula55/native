import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Inventory from "@/models/inventory";

/* ================= ASSIGN WAREHOUSE ================= */
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

    /* ================= CHECK WAREHOUSE ================= */
    const warehouseId = order.warehouseAssignments?.[0]?.warehouseId;

    if (!warehouseId) {
      return NextResponse.json(
        { success: false, message: "Warehouse not assigned to order" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE RESERVED STOCK ================= */
    for (const item of order.items) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
        warehouseId,
      });

      if (!inventory) {
        return NextResponse.json(
          {
            success: false,
            message: `Inventory missing for product ${item.productId}`,
          },
          { status: 400 }
        );
      }

      if (inventory.reservedQty < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Reserved stock not available for product ${item.productId}`,
          },
          { status: 400 }
        );
      }
    }

    /* ================= ASSIGN STORE FLAG ================= */
    // NOTE: Warehouse already assigned during order creation
    // So here we just confirm assignment

    order.isAssigned = true;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Warehouse assignment validated successfully",
    });

  } catch (err) {
    console.error("ASSIGN WAREHOUSE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}
