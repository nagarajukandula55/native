import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sku from "@/models/Sku";

export async function GET() {
  try {
    await connectDB();
    const skus = await Sku.find({})
      .populate("product", "name")
      .populate("warehouse", "name city");
    return NextResponse.json({ success: true, skus });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
