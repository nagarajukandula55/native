// app/api/admin/inventory/[id]/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Inventory from "@/models/Inventory";
import db from "@/lib/db";

async function connectDB() {
  await db(); // use centralized DB connection
}

/* ================= UPDATE STOCK QUANTITY ================= */
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await req.json();

    if (!body.qty) {
      return NextResponse.json(
        { success: false, message: "Quantity (qty) is required" },
        { status: 400 }
      );
    }

    const updated = await Inventory.findByIdAndUpdate(
      id,
      { qty: Number(body.qty) },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Inventory entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stock quantity updated successfully",
      inventory: updated,
    });
  } catch (error) {
    console.error("UPDATE INVENTORY ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
