import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Missing slug" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      slug,
      isActive: true,
      isListed: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const variants = product.variants?.length
      ? product.variants
      : product.primaryVariant
      ? [product.primaryVariant]
      : [];

    const currentVariant = variants[0] || {};

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        sellingPrice:
          currentVariant?.sellingPrice || product?.pricing?.sellingPrice || 0,
        mrp:
          currentVariant?.mrp || product?.pricing?.mrp || 0,
        stock: currentVariant?.stock || 0,
      },
      variants,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
