import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const newProduct = await Product.create({
      ...body,
      status: body.status || "review", // ✅ IMPORTANT
      isActive: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
    });

  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
