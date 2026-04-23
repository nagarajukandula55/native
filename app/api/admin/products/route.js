import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // make sure path correct
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // 👉 Save product
    const newProduct = await Product.create({
      ...body,
      isActive: false, // not live yet
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
    });

  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save product" },
      { status: 500 }
    );
  }
}
