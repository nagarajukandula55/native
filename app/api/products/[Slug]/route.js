import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

/* 🔥 HELPER: Normalize Variant Value */
function getNumericValue(variant) {
  if (!variant) return 0;

  const num = parseFloat(variant);
  if (variant.toUpperCase().includes("KG")) return num * 1000;
  if (variant.toUpperCase().includes("L")) return num * 1000;

  return num; // GM / ML
}

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { slug } = params;

    /* ================= FIND MAIN PRODUCT ================= */
    const baseProduct = await Product.findOne({ slug }).lean();

    if (!baseProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= FETCH ALL VARIANTS ================= */
    const variantsRaw = await Product.find({
      productKey: baseProduct.productKey,
    }).lean();

    /* ================= SORT VARIANTS PROPERLY ================= */
    const sortedVariantsRaw = variantsRaw.sort((a, b) => {
      return getNumericValue(a.variant) - getNumericValue(b.variant);
    });

    /* ================= FORMAT VARIANTS ================= */
    const variants = sortedVariantsRaw.map((v) => ({
      _id: v._id,
      sku: v.sku,
      variant: v.variant,
      variantValue: v.variantValue,
      variantUnit: v.variantUnit,
      sellingPrice: v.sellingPrice,
      mrp: v.mrp,
      images: v.images,
      slug: v.slug,
    }));

    /* ================= DEFAULT VARIANT LOGIC ================= */
    let defaultVariant =
      variants.find((v) => v.slug === slug) || variants[0];

    /* ================= CALCULATE DISCOUNT ================= */
    const discount =
      defaultVariant?.mrp && defaultVariant?.sellingPrice
        ? Math.round(
            ((defaultVariant.mrp - defaultVariant.sellingPrice) /
              defaultVariant.mrp) *
              100
          )
        : 0;

    /* ================= FINAL RESPONSE ================= */
    return NextResponse.json({
      product: {
        _id: baseProduct._id,
        name: baseProduct.name,
        slug: baseProduct.slug,
        productKey: baseProduct.productKey,
        category: baseProduct.category,

        description: baseProduct.description,
        shortDescription: baseProduct.shortDescription,

        ingredients: baseProduct.ingredients,
        shelfLife: baseProduct.shelfLife,
        fssai: baseProduct.fssai,

        hsn: baseProduct.hsn,
        tax: baseProduct.tax,

        images: defaultVariant?.images || baseProduct.images,

        /* 🔥 USE DEFAULT VARIANT */
        sellingPrice: defaultVariant?.sellingPrice,
        mrp: defaultVariant?.mrp,
        variant: defaultVariant?.variant,

        discount,
      },

      variants,
    });

  } catch (err) {
    console.error("PRODUCT API ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
