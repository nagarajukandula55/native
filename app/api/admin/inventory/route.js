// app/api/admin/inventory/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Inventory from "@/models/Inventory";
import db from "@/lib/db";

async function connectDB() {
  await db(); // connect using your centralized DB helper
}

/* ================= GET INVENTORY ================= */
export async function GET() {
  try {
    await connectDB();

    const list = await Inventory.find()
      .populate("product")
      .populate("warehouse")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error("GET INVENTORY ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/* ================= ADD / UPDATE STOCK ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { product, warehouse, qty, costPrice } = body;

    if (!product || !warehouse || !qty) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing fields: product, warehouse, qty required",
        },
        { status: 400 }
      );
    }

    // Check if stock entry already exists
    let stock = await Inventory.findOne({ product, warehouse });

    if (stock) {
      // Update existing stock
      stock.qty += Number(qty);
      stock.costPrice = Number(costPrice) || stock.costPrice;
      await stock.save();
    } else {
      // Create new stock entry
      await Inventory.create({
        product,
        warehouse,
        qty: Number(qty),
        costPrice: Number(costPrice) || 0,
        reorderLevel: 5,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Stock added/updated successfully",
    });
  } catch (error) {
    console.error("INVENTORY CREATE/UPDATE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
