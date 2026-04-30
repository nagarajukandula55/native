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
    const product = await Product.findOne({
      slug,
      status: "approved",
      isActive: true,
      isListed: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= VARIANTS ================= */
    let variants = product.variants || [];

    const primary = product.primaryVariant || null;

    // fallback if variants not stored as array
    if (!variants.length && primary) {
      variants = [primary];
    }

    /* ================= NORMALIZE VARIANTS ================= */
    const normalizedVariants = variants.map((v, index) => ({
      _id: v._id || index,
      sku: v.sku || "",
      sellingPrice: v.sellingPrice || 0,
      mrp: v.mrp || 0,
      stock: v.stock ?? 0,
      images: v.images || product.images || [],
      variant: v.variant || `${v.value || ""} ${v.unit || ""}`,
      slug: v.slug || product.slug,
    }));

    /* ================= CURRENT VARIANT ================= */
    const currentVariant = normalizedVariants[0] || {};

    /* ================= PRICING ================= */
    const price = currentVariant.sellingPrice || 0;
    const mrp = currentVariant.mrp || 0;

    const discount =
      mrp > 0
        ? Math.round(((mrp - price) / mrp) * 100)
        : 0;

    /* ================= FINAL RESPONSE ================= */
    return NextResponse.json({
      success: true,

      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        productKey: product.productKey,

        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,

        description:
          product.description ||
          product.shortDescription ||
          "",

        shortDescription: product.shortDescription || "",

        ingredients: product.ingredients || [],

        images:
          currentVariant.images?.length > 0
            ? currentVariant.images
            : product.images || [],

        /* PRIMARY DISPLAY VALUES */
        sellingPrice: price,
        mrp: mrp,
        stock: currentVariant.stock,
        sku: currentVariant.sku,

        /* EXTRA */
        tax: product.tax,
        hsn: product.hsn,

        discount,
      },

      variants: normalizedVariants,
    });

  } catch (err) {
    console.error("SLUG API ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
