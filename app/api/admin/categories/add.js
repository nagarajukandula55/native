import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductCategory from "@/models/ProductCategory";

export async function POST(req) {
  try {
    await connectDB();
    const { name, gstCategory } = await req.json();

    if (!name || !gstCategory)
      return NextResponse.json(
        { success: false, message: "Category name and GST Category required" },
        { status: 400 }
      );

    const existing = await ProductCategory.findOne({ name });
    if (existing)
      return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });

    const category = await ProductCategory.create({ name, gstCategory });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 500 });
  }
}
