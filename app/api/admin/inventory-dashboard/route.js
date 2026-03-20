export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";
import Inventory from "@/models/inventory";

/* ✅ SAFE MODEL LOAD (NO BUILD ERROR) */
let InventoryMovement;
try {
  InventoryMovement = require("@/models/InventoryMovement").default;
} catch {
  InventoryMovement = null;
}

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

    /* ✅ TOTAL STOCK */
    const stockAgg = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$qty" } } }
    ]);

    const totalStock = stockAgg[0]?.total || 0;

    /* ✅ LOW STOCK */
    const lowStock = await Inventory.countDocuments({
      $expr: { $lte: ["$qty", "$reorderLevel"] }
    });

    /* ✅ RECENT MOVEMENTS */
    let recentMoves = [];

    if (InventoryMovement) {
      recentMoves = await InventoryMovement.find()
        .sort({ createdAt: -1 })
        .limit(5);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalWarehouses,
        totalStock,
        lowStock,
        recentMoves
      }
    });

  } catch (error) {
    console.log("DASHBOARD ERROR:", error);

    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
