import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({ status: "review" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (err) {
    console.error("REVIEW ERROR:", err);

    return NextResponse.json(
      { success: false, products: [] },
      { status: 500 }
    );
  }
}
