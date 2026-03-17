import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sku from "@/models/Sku";

export async function POST(req) {
  try {
    await connectDB();
    const { id, value } = await req.json();
    const sku = await Sku.findByIdAndUpdate(id, { isActive: value }, { new: true });
    return NextResponse.json({ success: true, sku });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
