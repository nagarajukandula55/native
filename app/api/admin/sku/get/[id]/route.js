import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sku from "@/models/Sku";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const sku = await Sku.findById(params.id)
      .populate("product", "name")
      .populate("warehouse", "name city");
    if (!sku) return NextResponse.json({ success: false, error: "SKU not found" });
    return NextResponse.json({ success: true, sku });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
