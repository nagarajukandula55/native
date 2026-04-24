import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("Incoming Product:", body); // ✅ DEBUG

    if (!body.name || !body.productKey) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      ...body,
      status: body.status || "review", // ✅ IMPORTANT
      isActive: false,
      images: body.images || [], // ✅ SAFE
      createdAt: new Date(),
      updatedAt: new Date(),
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
