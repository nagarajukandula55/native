import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("📦 Incoming Body:", body); // 🔥 DEBUG

    // 🔥 HARD VALIDATION (prevents silent crash)
    if (!body.name) throw new Error("Name missing");
    if (!body.productKey) throw new Error("productKey missing");
    if (!body.slug) throw new Error("slug missing");
    if (!body.sku) throw new Error("sku missing");

    const newProduct = await Product.create({
      ...body,
      isActive: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
    });

  } catch (error) {
    console.error("❌ PRODUCT CREATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message, // 🔥 IMPORTANT
      },
      { status: 500 }
    );
  }
}
