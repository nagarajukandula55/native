export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await connectDB();

    const inventory = await Inventory.find()
      .populate("productId", "name sku")
      .populate("warehouseId", "name code");

    return NextResponse.json({ success: true, inventory });

  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
