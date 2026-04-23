import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Inventory from "@/models/Inventory";

export async function POST(req) {
  await connectDB();

  const { sku, stock } = await req.json();

  let item = await Inventory.findOne({ sku });

  if (item) {
    item.stock += stock;
    await item.save();
  } else {
    item = await Inventory.create({ sku, stock });
  }

  return NextResponse.json({ success: true, item });
}

export async function GET() {
  await connectDB();

  const items = await Inventory.find();

  return NextResponse.json({ success: true, items });
}
