import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

/* 🔥 NORMALIZE VARIANT VALUE */
function getNumericValue(value = "") {
  const num = parseFloat(value);
  if (value.toUpperCase().includes("KG")) return num * 1000;
  if (value.toUpperCase().includes("L")) return num * 1000;
  return num;
}

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
    const baseProduct = await Product.findOne({
      slug,
      status: "approved",
      isListed: true,
    }).lean();

    if (!baseProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found or not listed" },
        { status: 404 }
      );
    }

    /* ================= GET ALL VARIANTS ================= */
    const variantsRaw = await Product.find({
      productKey: baseProduct.productKey,
      status: "approved",
      isListed: true,
    }).lean();

    /* ================= SORT VARIANTS ================= */
    const variantsSorted = variantsRaw.sort((a, b) => {
      return getNumericValue(a.variant || "") - getNumericValue(b.variant || "");
    });

    /* ================= FORMAT VARIANTS ================= */
    const variants = variantsSorted.map((v) => ({
      _id: v._id,
      slug: v.slug,
      sku: v.primaryVariant?.sku || v.sku,
      variant: v.variant || `${v.primaryVariant?.value}${v.primaryVariant?.unit}`,
      sellingPrice: v.primaryVariant?.sellingPrice || v.sellingPrice,
      mrp: v.primaryVariant?.mrp || v.mrp,
      stock: v.primaryVariant?.stock || v.stock,
      images: v.images || [],
    }));

    /* ================= CURRENT VARIANT ================= */
    const currentVariant =
      variants.find((v) => v.slug === slug) || variants[0] || {};

    const mrp = currentVariant?.mrp || 0;
    const sellingPrice = currentVariant?.sellingPrice || 0;

    const discount =
      mrp > 0
        ? Math.round(((mrp - sellingPrice) / mrp) * 100)
        : 0;

    /* ================= FINAL RESPONSE ================= */
    return NextResponse.json({
      success: true,
      product: {
        _id: baseProduct._id,
        name: baseProduct.name,
        slug: baseProduct.slug,
        productKey: baseProduct.productKey,
        description: baseProduct.description,
        shortDescription: baseProduct.shortDescription,
        category: baseProduct.category,
        images: currentVariant.images || baseProduct.images,
        sellingPrice,
        mrp,
        stock: currentVariant.stock,
        discount,
      },
      variants,
    });

  } catch (err) {
    console.error("SLUG API ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
