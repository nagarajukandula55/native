import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing slug",
        },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      slug,
    }).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const variants =
      product?.variants?.length > 0
        ? product.variants
        : product?.primaryVariant
        ? [product.primaryVariant]
        : [];

    const currentVariant = variants[0] || {};

    return NextResponse.json({
      success: true,

      product: {
        ...product,

        sellingPrice:
          currentVariant?.sellingPrice ??
          product?.sellingPrice ??
          0,

        mrp:
          currentVariant?.mrp ??
          product?.mrp ??
          0,

        stock:
          currentVariant?.stock ??
          product?.stock ??
          0,

        images:
          currentVariant?.images?.length
            ? currentVariant.images
            : product?.images || [],
      },

      variants,
    });
  } catch (err) {
    console.error("PRODUCT API ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}
