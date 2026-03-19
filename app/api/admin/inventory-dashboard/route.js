// app/api/admin/inventory-dashboard/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";
import Inventory from "@/models/Inventory";
import InventoryMovement from "@/models/InventoryMovement"; // ✅ Correct import

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function GET() {
  try {
    await connectDB();

    const totalProducts = await Product.countDocuments();
    const totalWarehouses = await Warehouse.countDocuments();

    const stockAgg = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$qty" } } },
    ]);

    const totalStock = stockAgg[0]?.total || 0;

    const lowStock = await Inventory.countDocuments({
      $expr: { $lte: ["$qty", "$reorderLevel"] },
    });

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
    console.log("DASHBOARD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
