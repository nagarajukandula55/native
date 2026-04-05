import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductCategory from "@/models/ProductCategory";

export async function GET() {
  try {
    await connectDB();
    const categories = await ProductCategory.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Failed to fetch categories" });
  }
}
