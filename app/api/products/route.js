import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const allProducts = await Product.find({});

    /* ================= GROUP BY PRODUCT KEY ================= */
    const grouped = {};

    for (let p of allProducts) {
      if (!grouped[p.productKey]) {
        grouped[p.productKey] = [];
      }
      grouped[p.productKey].push(p);
    }

    /* ================= PICK DEFAULT VARIANT ================= */
    const finalProducts = Object.values(grouped).map((group) => {
      // sort by price (lowest first)
      group.sort((a, b) => a.sellingPrice - b.sellingPrice);

      const base = group[0];

      const discount =
        base.mrp && base.sellingPrice
          ? Math.round(((base.mrp - base.sellingPrice) / base.mrp) * 100)
          : 0;

      return {
        _id: base._id,
        name: base.name,
        slug: base.slug,
        productKey: base.productKey,
        category: base.category,

        image: base.images?.[0] || "",
        sellingPrice: base.sellingPrice,
        mrp: base.mrp,
        discount,
      };
    });

    return NextResponse.json({ products: finalProducts });

  } catch (err) {
    console.error("PRODUCT LIST ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
