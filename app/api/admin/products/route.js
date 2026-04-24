import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    console.log("🔥 API HIT");

    await connectDB();
    console.log("✅ DB CONNECTED");

    const body = await req.json();
    console.log("📦 BODY RECEIVED:", body);

    const newProduct = await Product.create({
      ...body,
      status: body.status || "review",
      isActive: false,
      createdAt: new Date(),
    });

    console.log("✅ SAVED:", newProduct._id);

    return NextResponse.json({
      success: true,
      product: newProduct,
    });

  } catch (error) {
    console.error("❌ PRODUCT CREATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
