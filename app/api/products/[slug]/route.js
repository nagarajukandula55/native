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

    /* ================= FIND BASE PRODUCT ================= */
    const baseProduct = await Product.findOne({
      slug,
      isActive: true,
      isDeleted: false,
    }).lean();

    if (!baseProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= FETCH ALL VARIANTS ================= */
    const variantsRaw = await Product.find({
      productKey: baseProduct.productKey,
      isActive: true,
      isDeleted: false,
    }).lean();

    const variants = variantsRaw.map((v) => ({
      _id: v._id,
      sku: v.primaryVariant?.sku || v.sku,
      variant:
        v.primaryVariant?.variant ||
        `${v.primaryVariant?.value || ""}${v.primaryVariant?.unit || ""}`,
      sellingPrice:
        v.primaryVariant?.sellingPrice ||
        v.pricing?.sellingPrice ||
        0,
      mrp:
        v.primaryVariant?.mrp ||
        v.pricing?.mrp ||
        0,
      stock: v.primaryVariant?.stock || 0,
      images: v.images || [],
      slug: v.slug,
    }));

    /* ================= SELECT CURRENT VARIANT ================= */
    const currentVariant =
      variants.find((v) => v.slug === slug) ||
      variants[0] ||
      {};

    /* ================= DISCOUNT ================= */
    const discount =
      currentVariant?.mrp > 0
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
        _id: baseProduct._id,
        name: baseProduct.name,
        slug: baseProduct.slug,
        productKey: baseProduct.productKey,
        category: baseProduct.category,

        description: baseProduct.description,
        shortDescription: baseProduct.shortDescription,

        images: baseProduct.images || [],

        sellingPrice: currentVariant?.sellingPrice || 0,
        mrp: currentVariant?.mrp || 0,
        stock: currentVariant?.stock || 0,

        discount,
      },

      variants,
    });

  } catch (err) {
    console.error("PRODUCT API ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
