import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  await connectDB();
  const products = await Product.find()
    .populate("category subCategory gstCategory")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, products });
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const product = await Product.create(body);

  return NextResponse.json({ success: true, product });
}
