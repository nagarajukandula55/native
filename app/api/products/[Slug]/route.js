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

    /* ================= FIND PRODUCT ================= */
    const product = await Product.findOne({
      slug,
      status: "approved",
      isListed: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= BUILD VARIANT FROM SAME DOC ================= */
    const primary = product.primaryVariant || {};

    const variant = {
      _id: product._id,
      sku: primary.sku,
      variant: `${primary.value || ""}${primary.unit || ""}`,
      sellingPrice: primary.sellingPrice || 0,
      mrp: primary.mrp || 0,
      stock: primary.stock || 0,
      images: product.images || [],
      slug: product.slug, // 🔥 IMPORTANT
    };

    /* ================= DISCOUNT ================= */
    const discount =
      variant.mrp > 0
        ? Math.round(
            ((variant.mrp - variant.sellingPrice) / variant.mrp) * 100
          )
        : 0;

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        productKey: product.productKey,
        description: product.description,
        shortDescription: product.shortDescription,
        category: product.category,
        images: product.images,

        sellingPrice: variant.sellingPrice,
        mrp: variant.mrp,
        stock: variant.stock,
        discount,
      },

      variants: [variant], // 🔥 ALWAYS ARRAY
    });

  } catch (err) {
    console.error("SLUG API ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
