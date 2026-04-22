import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { slug } = params;

    /* ================= FIND MAIN PRODUCT ================= */
    const baseProduct = await Product.findOne({ slug });

    if (!baseProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= FETCH ALL VARIANTS ================= */
    const variantsRaw = await Product.find({
      productKey: baseProduct.productKey,
    }).sort({ variant: 1 });

    /* ================= FORMAT VARIANTS ================= */
    const variants = variantsRaw.map((v) => ({
      _id: v._id,
      sku: v.sku,
      variant: v.variant,
      sellingPrice: v.sellingPrice,
      mrp: v.mrp,
      images: v.images,
      slug: v.slug,
    }));

    /* ================= SELECT DEFAULT ================= */
    // pick lowest price OR first variant
    const defaultVariant =
      variants.sort((a, b) => a.sellingPrice - b.sellingPrice)[0];

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

        images: baseProduct.images,

        // default variant pricing
        sellingPrice: defaultVariant?.sellingPrice,
        mrp: defaultVariant?.mrp,

        discount:
          defaultVariant?.mrp && defaultVariant?.sellingPrice
            ? Math.round(
                ((defaultVariant.mrp - defaultVariant.sellingPrice) /
                  defaultVariant.mrp) *
                  100
              )
            : 0,
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
