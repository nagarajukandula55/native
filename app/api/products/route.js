import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    /* 🔥 FETCH ALL ACTIVE PRODUCTS */
    const products = await Product.find({ isActive: true }).lean();

    /* 🔥 GROUP BY productKey */
    const grouped = {};

    for (let p of products) {
      if (!grouped[p.productKey]) {
        grouped[p.productKey] = [];
      }
      grouped[p.productKey].push(p);
    }

    /* 🔥 BUILD FINAL LIST */
    const finalProducts = Object.values(grouped).map((variants) => {
      
      /* ✅ SORT BY PRICE (LOWEST FIRST) */
      variants.sort((a, b) => a.sellingPrice - b.sellingPrice);

      const best = variants[0]; // default variant

      const discount =
        best.mrp && best.sellingPrice
          ? Math.round(((best.mrp - best.sellingPrice) / best.mrp) * 100)
          : 0;

      return {
        _id: best._id,
        name: best.name,
        productKey: best.productKey,
        category: best.category,

        slug: best.slug,
        image: best.images?.[0] || "",

        price: best.sellingPrice,
        mrp: best.mrp,
        discount,

        variantsCount: variants.length,
      };
    });

    /* 🔥 SORT BY LATEST */
    finalProducts.sort((a, b) => new Date(b._id) - new Date(a._id));

    return NextResponse.json({
      success: true,
      products: finalProducts,
    });

  } catch (err) {
    console.error("PRODUCT LIST ERROR:", err);

    return NextResponse.json(
      { success: false, products: [] },
      { status: 500 }
    );
  }
}
