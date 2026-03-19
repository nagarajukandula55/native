// app/api/admin/inventory-dashboard/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";
import Inventory from "@/models/Inventory";
import InventoryMovement from "@/models/InventoryMovement"; // Corrected

import db from "@/lib/db";

async function connectDB() {
  await db(); // Use centralized DB connection
}

export async function GET() {
  try {
    await connectDB();

    // Total counts
    const totalProducts = await Product.countDocuments();
    const totalWarehouses = await Warehouse.countDocuments();

    // Total stock
    const stockAgg = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$qty" } } },
    ]);
    const totalStock = stockAgg[0]?.total || 0;

    // Low stock entries
    const lowStock = await Inventory.countDocuments({
      $expr: { $lte: ["$qty", "$reorderLevel"] },
    });

    // Recent stock movements
    const recentMoves = await InventoryMovement.find()
      .populate("product")
      .populate("warehouse")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalWarehouses,
        totalStock,
        lowStock,
        recentMoves,
      },
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
