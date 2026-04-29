import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
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

    /* ================= FETCH PRODUCT ================= */
    const product = await Product.findOne({ slug }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= VARIANTS LOGIC ================= */
    const variants = product.variants || [];

    const primary = product.primaryVariant || null;

    /* fallback if no variants array exists */
    const finalVariants =
      variants.length > 0
        ? variants
        : primary
        ? [primary]
        : [];

    /* ================= DEFAULT VARIANT ================= */
    const currentVariant = finalVariants[0] || primary || {};

    /* ================= DISCOUNT ================= */
    const discount =
      currentVariant?.mrp && currentVariant?.sellingPrice
        ? Math.round(
            ((currentVariant.mrp - currentVariant.sellingPrice) /
              currentVariant.mrp) *
              100
          )
        : 0;

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,

      product: {
        ...product,

        // normalize main display fields
        sellingPrice: currentVariant?.sellingPrice,
        mrp: currentVariant?.mrp,
        stock: currentVariant?.stock,
        sku: currentVariant?.sku,

        discount,
      },

      variants: finalVariants,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
