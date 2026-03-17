import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sku from "@/models/Sku";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.code || !body.product || !body.warehouse || !body.price)
      return NextResponse.json({ success: false, error: "Missing required fields" });

    const existing = await Sku.findOne({ code: body.code });
    if (existing) return NextResponse.json({ success: false, error: "SKU code already exists" });

    const sku = new Sku(body);
    await sku.save();

    return NextResponse.json({ success: true, sku });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
