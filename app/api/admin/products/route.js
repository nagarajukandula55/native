import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("📦 Incoming Body:", body);

    // ================= SAFE VALIDATION =================
    const requiredFields = ["name", "productKey", "slug", "sku"];

    const missingFields = requiredFields.filter(
      (field) => !body?.[field]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ================= CLEAN DATA =================
    const productData = {
      ...body,

      // ensure safe defaults
      isActive: false,
      createdAt: new Date(),

      // prevent undefined overwrites
      tags: body.tags || "",
      images: body.images || [],
      ingredients: body.ingredients || [],
      variants: body.variants || [],
    };

    // ================= SAVE =================
    const newProduct = await Product.create(productData);

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });

  } catch (error) {
    console.error("❌ PRODUCT CREATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
